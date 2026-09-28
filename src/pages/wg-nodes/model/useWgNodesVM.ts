import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import {
  useDeleteWgNode,
  useProvisionWgNodeVM,
  useWgNodeFormVM,
} from "@features/manage-wg-node";
import { IMainApi } from "@shared/api";
import type {
  IWgAgentReleaseInfo,
  IWgMeshMatrix,
  WgNodeDto,
} from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useEffect } from "react";

/** Список нод, матрица связности и действия с нодами. */
export const useWgNodesVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const nodes = IWgNodesStore.useInstance();
  const canView = userStore.can(WG_PERMISSIONS.NODE_VIEW);
  const canViewMesh = canView && userStore.can(WG_PERMISSIONS.STATS_VIEW);
  const canCreate = userStore.can(WG_PERMISSIONS.NODE_CREATE);
  const canUpdate = userStore.can(WG_PERMISSIONS.NODE_UPDATE);
  const canDelete = userStore.can(WG_PERMISSIONS.NODE_DELETE);
  const canProvision = userStore.can(WG_PERMISSIONS.NODE_PROVISION);
  const canAgent = canView && userStore.can(WG_PERMISSIONS.NODE_AGENT);

  const form = useWgNodeFormVM({ onSaved: nodes.upsert });
  const provision = useProvisionWgNodeVM({});
  const remove = useDeleteWgNode({ onDeleted: node => nodes.remove(node.id) });

  // Матрица связности — снимок, дальше события комнаты (пробы агентов).
  const mesh = useEntity<IWgMeshMatrix>({
    queryFn: () => api.wgStatsMesh(),
    autoLoad: true,
    enabled: canViewMesh,
  });

  // Раздаваемая бэкендом версия агента: какие ноды отстают.
  const release = useEntity<IWgAgentReleaseInfo>({
    queryFn: () => api.wgAgentRelease(),
    autoLoad: true,
    enabled: canAgent,
  });

  useEffect(() => {
    if (canView) void nodes.load();
  }, [canView, nodes]);

  useCloseWhenForbidden(form.open, form.editing ? canUpdate : canCreate, () =>
    form.setOpen(false),
  );
  useCloseWhenForbidden(!!provision.node, canProvision, provision.close);

  useSocketRoom("wg-nodes", canView ? "all" : null, () => void nodes.load());
  useSocketRoom("wg-overview", canViewMesh ? "all" : null, () =>
    mesh.refresh(),
  );
  useSocketEvent<[WgNodeDto]>("wg:node:updated", nodes.upsert, canView);
  useSocketEvent<[{ id: string }]>(
    "wg:node:deleted",
    ({ id }) => nodes.remove(id),
    canView,
  );
  useSocketEvent<[IWgMeshMatrix]>("wg:stats:mesh", mesh.setData, canViewMesh);

  return {
    nodes: nodes.nodes,
    isLoading: nodes.isLoading,
    error: nodes.error,
    mesh: mesh.data,
    release: release.data ?? null,
    form,
    provision,
    remove,
    canCreate,
    canUpdate,
    canDelete,
    canProvision,
  };
};

export type WgNodesVM = ReturnType<typeof useWgNodesVM>;
