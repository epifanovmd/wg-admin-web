import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS, wgOwners } from "@entities/wg";
import { useAssignWgOwnerVM } from "@features/assign-wg-owner";
import {
  endpointWarnings,
  useDeleteWgEndpoint,
  useWgEndpointFormVM,
} from "@features/manage-wg-endpoint";
import { IMainApi } from "@shared/api";
import type { WgEndpointDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useCallback, useEffect } from "react";

/** Действия над конкретной точкой по области прав. */
export interface IWgEndpointRowAccess {
  canUpdate: boolean;
  canDelete: boolean;
  canAssign: boolean;
}

/**
 * Точки подключения и действия с ними. С областью «свои» — только свои точки
 * (владелец или создатель); действия — по строке.
 */
export const useWgEndpointsVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const nodesStore = IWgNodesStore.useInstance();
  const viewScope = userStore.scope(WG_PERMISSIONS.ENDPOINT_VIEW);
  const canView = viewScope !== null;

  const accessOf = (endpoint: WgEndpointDto): IWgEndpointRowAccess => {
    const owners = wgOwners(endpoint);

    return {
      canUpdate: userStore.canOn(WG_PERMISSIONS.ENDPOINT_UPDATE, owners),
      canDelete: userStore.canOn(WG_PERMISSIONS.ENDPOINT_DELETE, owners),
      canAssign: userStore.canOn(WG_PERMISSIONS.ENDPOINT_ASSIGN, owners),
    };
  };

  const endpoints = useCollection<WgEndpointDto>({
    queryFn: async () => {
      const { data, error } = await api.listWgEndpoints({ limit: 100 });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: endpoint => endpoint.id,
    autoLoad: true,
    enabled: canView,
  });

  const upsert = (endpoint: WgEndpointDto) =>
    endpoints.upsertItem(endpoint.id, endpoint);

  const form = useWgEndpointFormVM({ onSaved: upsert });
  const canCreate = userStore.can(WG_PERMISSIONS.ENDPOINT_CREATE);
  const owner = useAssignWgOwnerVM<WgEndpointDto>({ onSaved: upsert });

  const openOwner = (endpoint: WgEndpointDto) =>
    owner.openFor({
      title: `Точка ${endpoint.name}`,
      ownerId: endpoint.ownerId,
      assign: userId => api.assignWgEndpoint(endpoint.id, { userId }),
      revoke: () => api.revokeWgEndpoint(endpoint.id),
    });

  useCloseWhenForbidden(
    form.open,
    form.editing ? accessOf(form.editing).canUpdate : canCreate,
    () => form.setOpen(false),
  );
  const remove = useDeleteWgEndpoint({
    onDeleted: endpoint => endpoints.removeItem(endpoint.id),
  });

  // Названия релей-нод для таблицы — при праве видеть ноды (хотя бы свои).
  const canViewNodes = userStore.scope(WG_PERMISSIONS.NODE_VIEW) !== null;

  useEffect(() => {
    if (canView && canViewNodes) void nodesStore.load();
  }, [canView, canViewNodes, nodesStore]);

  // Все точки — из комнаты списка; свои приходят адресно.
  useSocketRoom("wg-endpoints", viewScope === "all" ? "all" : null, () =>
    endpoints.refresh(),
  );
  useSocketEvent<[WgEndpointDto]>(
    "wg:endpoint:updated",
    endpoint => {
      upsert(endpoint);
      form.syncEditing(endpoint);
    },
    canView,
  );
  useSocketEvent<[{ id: string }]>(
    "wg:endpoint:deleted",
    ({ id }) => endpoints.removeItem(id),
    canView,
  );

  // Чтение nodes здесь подписывает страницу на загрузку нод.
  const nodes = nodesStore.nodes;
  const relayNodeName = useCallback(
    (id: string | null) =>
      id ? (nodes.find(node => node.id === id)?.name ?? id.slice(0, 8)) : null,
    [nodes],
  );

  const warningsOf = useCallback(
    (endpoint: WgEndpointDto) => endpointWarnings(endpoint, nodes),
    [nodes],
  );

  return {
    endpoints,
    relayNodeName,
    warningsOf,
    form,
    remove,
    owner,
    openOwner,
    canCreate,
    /** Действия над точкой: право на все или своя. */
    accessOf,
    accessKey: userStore.accessKey,
  };
};

export type WgEndpointsVM = ReturnType<typeof useWgEndpointsVM>;
