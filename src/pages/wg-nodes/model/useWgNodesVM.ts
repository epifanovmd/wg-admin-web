import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import {
  useDeleteWgNode,
  useProvisionWgNodeVM,
  useWgNodeFormVM,
} from "@features/manage-wg-node";
import { IMainApi } from "@shared/api";
import type { IWgMeshMatrix, WgNodeDto } from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useEffect } from "react";

/** Список нод, матрица связности и действия с нодами. */
export const useWgNodesVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const nodes = IWgNodesStore.useInstance();
  const canView = userStore.can(WG_PERMISSIONS.NODE_VIEW);
  const canViewMesh = canView && userStore.can(WG_PERMISSIONS.STATS_VIEW);

  const form = useWgNodeFormVM({ onSaved: nodes.upsert });
  const provision = useProvisionWgNodeVM({});
  const remove = useDeleteWgNode({ onDeleted: node => nodes.remove(node.id) });

  // Матрица связности — снимок, дальше события комнаты (пробы агентов).
  const mesh = useEntity<IWgMeshMatrix>({
    queryFn: () => api.wgStatsMesh(),
    autoLoad: true,
    enabled: canViewMesh,
  });

  useEffect(() => {
    if (canView) void nodes.load();
  }, [canView, nodes]);

  useSocketRoom("wg-overview", canView ? "all" : null, () => {
    void nodes.load();
    if (canViewMesh) void mesh.refresh();
  });
  useSocketEvent<[WgNodeDto]>("wg:node:updated", nodes.upsert, canView);
  useSocketEvent<[IWgMeshMatrix]>("wg:stats:mesh", mesh.setData, canViewMesh);

  return {
    nodes: nodes.nodes,
    isLoading: nodes.isLoading,
    error: nodes.error,
    mesh: mesh.data,
    form,
    provision,
    remove,
    canManage: userStore.can(WG_PERMISSIONS.NODE_MANAGE),
    canProvision: userStore.can(WG_PERMISSIONS.NODE_PROVISION),
  };
};

export type WgNodesVM = ReturnType<typeof useWgNodesVM>;
