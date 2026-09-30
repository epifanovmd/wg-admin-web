import { IUserStore } from "@entities/user";
import {
  type IWgNodeLive,
  useWgLiveSpeed,
  WG_PERMISSIONS,
  wgOwners,
} from "@entities/wg";
import { useAssignWgOwnerVM } from "@features/assign-wg-owner";
import {
  useMoveWgInterfaceVM,
  useWgInterfaceAccess,
  useWgInterfaceActions,
  useWgInterfaceFormVM,
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
 * обновление агента, действия. Загрузка и подписки — только с правом просмотра;
 * действия — по области прав на эту ноду (своя — владелец или создатель).
 */
export const useWgNodeDetailVM = (nodeId: string) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const navigate = useNavigate();
  const canView = userStore.scope(WG_PERMISSIONS.NODE_VIEW) !== null;
  // Интерфейсы ноды — отдельный список с отдельным правом просмотра.
  const interfaceScope = userStore.scope(WG_PERMISSIONS.INTERFACE_VIEW);
  const canViewInterfaces = canView && interfaceScope !== null;
  const interfaceAccess = useWgInterfaceAccess();
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

  // Перенесённый или копия убрана с этой ноды — строка пропадает.
  const upsertInterface = (iface: WgInterfaceDto) => {
    const hosted =
      iface.nodeId === nodeId ||
      iface.replicas.some(replica => replica.nodeId === nodeId);

    if (hosted) interfaces.upsertItem(iface.id, iface);
    else interfaces.removeItem(iface.id);
  };

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
    enabled: canView && userStore.scope(WG_PERMISSIONS.NODE_AGENT) !== null,
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
  // Все интерфейсы — из комнаты списка; свои приходят адресно.
  useSocketRoom("wg-interfaces", interfaceScope === "all" ? "all" : null, () =>
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
    upsertInterface,
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
  const owner = useAssignWgOwnerVM<WgNodeDto>({ onSaved: node.setData });
  const owners = node.data ? wgOwners(node.data) : [];
  const canOnNode = (permission: string) =>
    !!node.data && userStore.canOn(permission, owners);
  const canUpdate = canOnNode(WG_PERMISSIONS.NODE_UPDATE);
  const canDelete = canOnNode(WG_PERMISSIONS.NODE_DELETE);
  const canAgent = canOnNode(WG_PERMISSIONS.NODE_AGENT);
  const canLogs = canOnNode(WG_PERMISSIONS.NODE_LOGS);
  const canProvision = canOnNode(WG_PERMISSIONS.NODE_PROVISION);
  const canAssign = canOnNode(WG_PERMISSIONS.NODE_ASSIGN);

  const openOwner = () => {
    const current = node.data;

    if (!current) return;
    owner.openFor({
      title: `Нода ${current.name}`,
      ownerId: current.ownerId,
      assign: userId => api.assignWgNode(current.id, { userId }),
      revoke: () => api.revokeWgNode(current.id),
    });
  };
  // Перенос уводит интерфейс с ноды, копия — обновляет строку.
  const move = useMoveWgInterfaceVM({ onMoved: upsertInterface });
  const removeNode = useDeleteWgNode({
    onDeleted: () => void navigate({ to: "/wg/nodes" }),
  });

  useCloseWhenForbidden(nodeForm.open, canUpdate, () =>
    nodeForm.setOpen(false),
  );
  useCloseWhenForbidden(
    interfaceForm.open,
    interfaceForm.editing
      ? interfaceAccess.accessOf(interfaceForm.editing).canUpdate
      : interfaceAccess.canCreate,
    () => interfaceForm.setOpen(false),
  );
  useCloseWhenForbidden(!!provision.node, canProvision, provision.close);
  useCloseWhenForbidden(
    move.open,
    !!move.iface &&
      (move.mode === "copy"
        ? interfaceAccess.accessOf(move.iface).canReplicas
        : interfaceAccess.accessOf(move.iface).canMove),
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
    canAssign,
    owner,
    openOwner,
    canViewInterfaces,
    interfaceAccess,
  };
};

export type WgNodeDetailVM = ReturnType<typeof useWgNodeDetailVM>;
