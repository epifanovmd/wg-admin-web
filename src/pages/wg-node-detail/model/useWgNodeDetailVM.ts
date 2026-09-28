import { IUserStore } from "@entities/user";
import { type IWgNodeLive, useWgLiveSpeed, WG_PERMISSIONS } from "@entities/wg";
import {
  useMoveWgInterfaceVM,
  useWgInterfaceActions,
  useWgInterfaceFormVM,
  useWgInterfacePermissions,
} from "@features/manage-wg-interface";
import {
  useDeleteWgNode,
  useProvisionWgNodeVM,
  useWgNodeFormVM,
} from "@features/manage-wg-node";
import { IMainApi } from "@shared/api";
import type {
  IWgAgentReleaseInfo,
  IWgLinkHealth,
  IWgNodeMetricPointDto,
  JobRunDto,
  WgInterfaceDto,
  WgNodeDto,
} from "@shared/api/gen/main/model";
import { useCollection, useEntity, useMutation } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useNavigate } from "@tanstack/react-router";

/** Scope задач ноды на бэкенде (установка и удаление агента). */
const NODE_JOB_SCOPE = "wg-node";

/** Строк журнала агента за запрос. */
const LOG_LINES = 300;

/**
 * Карточка ноды: данные, интерфейсы, live-статистика и метрики, журнал и
 * обновление агента, действия. Загрузка и подписки — только с правом просмотра.
 */
export const useWgNodeDetailVM = (nodeId: string) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const navigate = useNavigate();
  const canView = userStore.can(WG_PERMISSIONS.NODE_VIEW);
  // Интерфейсы ноды — отдельный список с отдельным правом просмотра.
  const canViewInterfaces =
    canView && userStore.can(WG_PERMISSIONS.INTERFACE_VIEW);
  const canUpdate = userStore.can(WG_PERMISSIONS.NODE_UPDATE);
  const canDelete = userStore.can(WG_PERMISSIONS.NODE_DELETE);
  const canAgent = userStore.can(WG_PERMISSIONS.NODE_AGENT);
  const canLogs = userStore.can(WG_PERMISSIONS.NODE_LOGS);
  const canProvision = userStore.can(WG_PERMISSIONS.NODE_PROVISION);
  const interfacePermissions = useWgInterfacePermissions();
  const liveId = canView ? nodeId : null;

  const node = useEntity<WgNodeDto, string>({
    queryFn: id => api.getWgNode(id),
    watch: [nodeId],
    enabled: canView,
  });

  const interfaces = useCollection<WgInterfaceDto, string>({
    queryFn: async id => {
      // Всё, что работает на ноде: свои интерфейсы и копии чужих.
      const { data, error } = await api.listWgInterfaces({
        hostNodeId: id,
        limit: 100,
      });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: iface => iface.id,
    watch: [nodeId],
    enabled: canViewInterfaces,
  });

  const metrics = useEntity<IWgNodeMetricPointDto[], string>({
    queryFn: id => api.wgNodeMetrics({ nodeId: id }),
    watch: [nodeId],
    enabled: canView,
  });

  const links = useEntity<IWgLinkHealth[], string>({
    queryFn: id => api.wgStatsNodeLinks(id),
    watch: [nodeId],
    enabled: canView,
  });

  // Последняя задача установки агента; дальше — job:updated в комнате ноды.
  const provisionJob = useEntity<JobRunDto, string>({
    queryFn: async id => {
      const { data, error } = await api.listJobs({
        scopeType: NODE_JOB_SCOPE,
        scopeId: id,
        limit: 1,
      });

      return { data: data?.items[0] ?? null, error };
    },
    watch: [nodeId],
    enabled: canView,
  });

  const release = useEntity<IWgAgentReleaseInfo>({
    queryFn: () => api.wgAgentRelease(),
    autoLoad: true,
    enabled: canAgent,
  });

  const logs = useEntity<string, string>({
    queryFn: async id => {
      const res = await api.wgNodeLogs(id, { lines: LOG_LINES });

      return res.error
        ? { error: res.error }
        : { data: res.data.content || "Журнал пуст" };
    },
  });

  // Live-снимок для мгновенной отрисовки, дальше — события комнаты.
  const speed = useWgLiveSpeed<IWgNodeLive>({
    id: liveId,
    event: "wg:node:stats",
    select: (snapshot, id) => (snapshot.nodeId === id ? snapshot : null),
    load: id => api.wgStatsCurrentNode(id),
    loadWindow: id => api.wgStatsNodeWindow(id),
  });

  useSocketRoom("wg-node", liveId, () => {
    void node.refresh(nodeId);
    void links.refresh(nodeId);
    void speed.reload();
  });
  useSocketRoom("wg-interfaces", canViewInterfaces ? "all" : null, () =>
    interfaces.refresh(nodeId),
  );
  useSocketEvent<[{ id: string }]>(
    "wg:node:deleted",
    ({ id }) => {
      if (id !== nodeId) return;
      toast.warning("Нода удалена");
      void navigate({ to: "/wg/nodes" });
    },
    canView,
  );
  useSocketEvent<[{ nodeId: string; links: IWgLinkHealth[] }]>(
    "wg:node:links",
    snapshot => {
      if (snapshot.nodeId === nodeId) links.setData(snapshot.links);
    },
    canView,
  );
  useSocketEvent<[JobRunDto]>(
    "job:updated",
    job => {
      if (job.scopeType === NODE_JOB_SCOPE && job.scopeId === nodeId) {
        provisionJob.setData(job);
      }
    },
    canView,
  );
  useSocketEvent<[WgNodeDto]>(
    "wg:node:updated",
    updated => {
      if (updated.id === nodeId) node.setData(updated);
    },
    canView,
  );
  useSocketEvent<[WgInterfaceDto]>(
    "wg:interface:updated",
    iface => {
      // Перенесённый или копия убрана — пропадает из списка этой ноды.
      const hosted =
        iface.nodeId === nodeId ||
        iface.replicas.some(replica => replica.nodeId === nodeId);

      if (hosted) interfaces.upsertItem(iface.id, iface);
      else interfaces.removeItem(iface.id);
    },
    canViewInterfaces,
  );
  useSocketEvent<[{ id: string }]>(
    "wg:interface:deleted",
    ({ id }) => interfaces.removeItem(id),
    canViewInterfaces,
  );

  /** Журнал ждёт ответа агента: пока идёт запрос, повторный не нужен. */
  const loadLogs = () => {
    if (logs.isBusy) return;
    if (logs.data === null) void logs.load(nodeId);
    else void logs.refresh(nodeId);
  };

  const updateAgent = useMutation({
    mutationFn: () => api.updateWgAgent(nodeId),
    onSuccess: () => toast.success("Агент обновляется и перезапустится"),
    onError: error => notifyApiError(toast, error),
  });

  const upsertInterface = (iface: WgInterfaceDto) =>
    interfaces.upsertItem(iface.id, iface);

  const interfaceActions = useWgInterfaceActions({
    onChanged: upsertInterface,
    onDeleted: iface => interfaces.removeItem(iface.id),
  });
  const nodeForm = useWgNodeFormVM({ onSaved: node.setData });
  const interfaceForm = useWgInterfaceFormVM({
    nodeId,
    onSaved: upsertInterface,
  });
  const provision = useProvisionWgNodeVM({});
  // Перенос уводит интерфейс с ноды, копия — обновляет строку.
  const move = useMoveWgInterfaceVM({
    onMoved: iface =>
      iface.nodeId === nodeId
        ? upsertInterface(iface)
        : interfaces.removeItem(iface.id),
  });
  const removeNode = useDeleteWgNode({
    onDeleted: () => void navigate({ to: "/wg/nodes" }),
  });

  useCloseWhenForbidden(nodeForm.open, canUpdate, () =>
    nodeForm.setOpen(false),
  );
  useCloseWhenForbidden(
    interfaceForm.open,
    interfaceForm.editing
      ? interfacePermissions.canUpdate
      : interfacePermissions.canCreate,
    () => interfaceForm.setOpen(false),
  );
  useCloseWhenForbidden(!!provision.node, canProvision, provision.close);
  useCloseWhenForbidden(
    move.open,
    move.mode === "copy"
      ? interfacePermissions.canReplicas
      : interfacePermissions.canMove,
    move.close,
  );

  return {
    node,
    interfaces,
    live: speed.live,
    speedPoints: speed.points,
    metrics: metrics.data ?? [],
    isMetricsLoading: metrics.isLoading,
    links: links.data ?? [],
    provisionJob: provisionJob.data,
    release: release.data,
    logs,
    loadLogs,
    updateAgent,
    interfaceActions,
    nodeForm,
    interfaceForm,
    provision,
    move,
    removeNode,
    canUpdate,
    canDelete,
    canAgent,
    canLogs,
    canProvision,
    canViewInterfaces,
    interfacePermissions,
  };
};

export type WgNodeDetailVM = ReturnType<typeof useWgNodeDetailVM>;
