import { AGENT_PERMISSIONS, IAgentsStore, isAgentLive } from "@entities/agent";
import { IUserStore } from "@entities/user";
import {
  type IWgNodeLive,
  useWgLiveSpeed,
  WG_PERMISSIONS,
  wgOwners,
} from "@entities/wg";
import { useAssignWgOwnerVM } from "@features/assign-wg-owner";
import { useAgentActions } from "@features/manage-agent";
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
  AgentDto,
  IWgLinkHealth,
  IWgNodeMetricPointDto,
  JobRunDto,
  WgInterfaceDto,
  WgNodeDto,
} from "@shared/api/gen/main/model";
import { useCollection, useEntity } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useNavigate } from "@tanstack/react-router";
import type { IAgentTabsAccess } from "@widgets/agent-tabs";
import { useEffect } from "react";

/** Scope задач ноды на бэкенде (установка и удаление агента). */
const NODE_JOB_SCOPE = "wg-node";

/**
 * Карточка ноды: данные, интерфейсы, live-статистика и метрики, агент ноды
 * (стор агентов: комната агента и `agent:updated`; вкладки — права ноды) и
 * действия. Загрузка и подписки — только с правом просмотра; действия — по
 * области прав на эту ноду (своя — владелец или создатель).
 */
export const useWgNodeDetailVM = (nodeId: string) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const agents = IAgentsStore.useInstance();
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

  const agentId = canView ? (node.data?.agentId ?? null) : null;
  const canViewAgents = userStore.can(AGENT_PERMISSIONS.VIEW);

  // Агент ноды — в сторе агентов; дальше — `agent:updated` из комнаты агента.
  const agentCard = useEntity<true, string>({
    queryFn: async id => {
      const { error } = await agents.fetch(id);

      return error ? { error } : { data: true };
    },
    watch: [agentId ?? ""],
    enabled: !!agentId,
  });

  useEffect(() => {
    // Сборки воркеров — с правом на агентов: из них кандидаты обновления.
    if (agentId && canViewAgents) void agents.loadRelease();
  }, [agentId, agents, canViewAgents]);

  const refreshAgent = () => {
    if (agentId) void agentCard.refresh(agentId);
  };

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
  // Комната агента: сервер держит наблюдателя — частые метрики и журнал.
  useSocketRoom("agent", agentId, refreshAgent);
  useSocketEvent<[AgentDto]>(
    "agent:updated",
    next => {
      if (next.id === agentId) agents.upsert(next);
    },
    !!agentId,
  );
  // Агент удалён: из стора агентов (нода без агента придёт `wg:node:updated`).
  useSocketEvent<[{ id: string }]>(
    "agent:deleted",
    ({ id }) => {
      if (id === agentId) agents.remove(id);
    },
    !!agentId,
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
      if (updated.id !== nodeId) return;
      // Агент отвязан: прежние скорость и показатели хоста уже не текущие —
      // снимок заново (сервер его сбросил).
      const unbound = !!node.data?.agentId && !updated.agentId;

      node.setData(updated);
      if (unbound) void speed.reload();
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

  const agent = agentId ? (agents.byId(agentId) ?? null) : null;
  const agentActions = useAgentActions();
  const agentLive = canAgent && !!agent && isAgentLive(agent);
  const agentAccess: IAgentTabsAccess = {
    canManage: canAgent,
    canConfig: canAgent,
    canCommand: canAgent,
    canLogs,
  };

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
    /** Агент ноды для вкладок; агента нет или он не загружен — `null`. */
    agent,
    agentAccess,
    agentAlerts: agentId ? agents.alertsOf(agentId) : [],
    agentActions,
    /** Можно обновить агента: на связи и есть новая версия. */
    canUpdateAgent: agentLive && !!agent?.updateAvailable,
    /** Новая версия для обновления; без права видеть сборки — неизвестна. */
    updateTarget: agentId
      ? (agents.updateCandidate(agentId)?.target ?? null)
      : null,
    canRotate: agentLive,
    canViewAgents,
    isAgentLoading: !!agentId && !agent && !agentCard.isError,
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
