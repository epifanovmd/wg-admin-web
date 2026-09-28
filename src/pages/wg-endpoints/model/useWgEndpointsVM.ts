import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
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

/** Точки подключения и действия с ними. */
export const useWgEndpointsVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const nodesStore = IWgNodesStore.useInstance();
  const canView = userStore.can(WG_PERMISSIONS.ENDPOINT_VIEW);

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
  const canUpdate = userStore.can(WG_PERMISSIONS.ENDPOINT_UPDATE);

  useCloseWhenForbidden(form.open, form.editing ? canUpdate : canCreate, () =>
    form.setOpen(false),
  );
  const remove = useDeleteWgEndpoint({
    onDeleted: endpoint => endpoints.removeItem(endpoint.id),
  });

  // Названия релей-нод для таблицы — при праве видеть ноды.
  const canViewNodes = userStore.can(WG_PERMISSIONS.NODE_VIEW);

  useEffect(() => {
    if (canView && canViewNodes) void nodesStore.load();
  }, [canView, canViewNodes, nodesStore]);

  useSocketRoom("wg-endpoints", canView ? "all" : null, () =>
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
    canCreate,
    canUpdate,
    canDelete: userStore.can(WG_PERMISSIONS.ENDPOINT_DELETE),
  };
};

export type WgEndpointsVM = ReturnType<typeof useWgEndpointsVM>;
