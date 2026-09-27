import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import {
  useDeleteWgEndpoint,
  useWgEndpointFormVM,
} from "@features/manage-wg-endpoint";
import { IMainApi } from "@shared/api";
import type { WgEndpointDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
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
  const remove = useDeleteWgEndpoint({
    onDeleted: endpoint => endpoints.removeItem(endpoint.id),
  });

  // Названия релей-нод для таблицы.
  useEffect(() => {
    if (canView) void nodesStore.load();
  }, [canView, nodesStore]);

  useSocketRoom("wg-endpoints", canView ? "all" : null, () =>
    endpoints.refresh(),
  );
  useSocketEvent<[WgEndpointDto]>("wg:endpoint:updated", upsert, canView);
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

  return {
    endpoints,
    relayNodeName,
    form,
    remove,
    canManage: userStore.can(WG_PERMISSIONS.ENDPOINT_MANAGE),
  };
};

export type WgEndpointsVM = ReturnType<typeof useWgEndpointsVM>;
