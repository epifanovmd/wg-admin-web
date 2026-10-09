import { useAgentRelease } from "@entities/agent";
import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS, wgOwners } from "@entities/wg";
import { useAssignWgOwnerVM } from "@features/assign-wg-owner";
import {
  useDeleteWgNode,
  useProvisionWgNodeVM,
  useWgNodeFormVM,
} from "@features/manage-wg-node";
import { IMainApi } from "@shared/api";
import type { IWgMeshMatrix, WgNodeDto } from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useEffect } from "react";

/** Действия над конкретной нодой по области прав. */
export interface IWgNodeRowAccess {
  canUpdate: boolean;
  canDelete: boolean;
  canProvision: boolean;
  canAssign: boolean;
}

/**
 * Список нод, матрица связности и действия с нодами. С областью «свои» —
 * только свои ноды (владелец или создатель); действия — по строке.
 */
export const useWgNodesVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const nodes = IWgNodesStore.useInstance();
  const viewScope = userStore.scope(WG_PERMISSIONS.NODE_VIEW);
  const canView = viewScope !== null;
  const canViewAll = viewScope === "all";
  // Матрица связности — по всем нодам: право на все ноды и всю статистику.
  const canViewMesh =
    canViewAll && userStore.scope(WG_PERMISSIONS.STATS_VIEW) === "all";
  const canCreate = userStore.can(WG_PERMISSIONS.NODE_CREATE);
  const canAgent =
    canView && userStore.scope(WG_PERMISSIONS.NODE_AGENT) !== null;

  const accessOf = (node: WgNodeDto): IWgNodeRowAccess => {
    const owners = wgOwners(node);

    return {
      canUpdate: userStore.canOn(WG_PERMISSIONS.NODE_UPDATE, owners),
      canDelete: userStore.canOn(WG_PERMISSIONS.NODE_DELETE, owners),
      canProvision: userStore.canOn(WG_PERMISSIONS.NODE_PROVISION, owners),
      canAssign: userStore.canOn(WG_PERMISSIONS.NODE_ASSIGN, owners),
    };
  };

  const form = useWgNodeFormVM({ onSaved: nodes.upsert });
  const provision = useProvisionWgNodeVM({});
  const remove = useDeleteWgNode({ onDeleted: node => nodes.remove(node.id) });
  const owner = useAssignWgOwnerVM<WgNodeDto>({ onSaved: nodes.upsert });

  const openOwner = (node: WgNodeDto) =>
    owner.openFor({
      title: `Нода ${node.name}`,
      ownerId: node.ownerId,
      assign: userId => api.assignWgNode(node.id, { userId }),
      revoke: () => api.revokeWgNode(node.id),
    });

  // Матрица связности — снимок, дальше события комнаты (пробы агентов).
  const mesh = useEntity<IWgMeshMatrix>({
    queryFn: () => api.wgStatsMesh(),
    autoLoad: true,
    enabled: canViewMesh,
  });

  // Сборки агента: какие агенты нод можно обновить (новая версия — по сокету).
  const release = useAgentRelease(canAgent);

  useEffect(() => {
    if (canView) void nodes.load();
  }, [canView, nodes]);

  useCloseWhenForbidden(
    form.open,
    form.editing ? accessOf(form.editing).canUpdate : canCreate,
    () => form.setOpen(false),
  );
  useCloseWhenForbidden(
    !!provision.node,
    !!provision.node && accessOf(provision.node).canProvision,
    provision.close,
  );

  // Все ноды — из комнаты списка; свои приходят адресно владельцу и создателю.
  useSocketRoom("wg-nodes", canViewAll ? "all" : null, () => void nodes.load());
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
    owner,
    openOwner,
    canCreate,
    /** Действия над нодой: право на все или своя нода. */
    accessOf,
    /** Меняется вместе с правами — колонки таблицы пересобираются по нему. */
    accessKey: userStore.accessKey,
  };
};

export type WgNodesVM = ReturnType<typeof useWgNodesVM>;
