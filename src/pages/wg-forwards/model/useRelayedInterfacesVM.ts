import { IUserStore } from "@entities/user";
import { WG_PERMISSIONS } from "@entities/wg";
import {
  useWgInterfaceAccess,
  useWgInterfaceActions,
} from "@features/manage-wg-interface";
import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";

/**
 * Пересылка точек через релей: интерфейсы за такими точками, их копии и
 * копия, на которую релей шлёт трафик. Живые обновления — события
 * интерфейсов (статусы копий, переключение, смена точки).
 */
export const useRelayedInterfacesVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const viewScope = userStore.scope(WG_PERMISSIONS.INTERFACE_VIEW);
  const canView = viewScope !== null;
  const access = useWgInterfaceAccess();

  const interfaces = useCollection<WgInterfaceDto>({
    queryFn: async () => {
      const { data, error } = await api.listWgInterfaces({
        viaRelay: true,
        limit: 100,
      });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: iface => iface.id,
    autoLoad: true,
    enabled: canView,
  });

  // Интерфейс ушёл с точки через релей — строки больше нет.
  const upsert = (iface: WgInterfaceDto) =>
    iface.endpoint?.mode === "relay"
      ? interfaces.upsertItem(iface.id, iface)
      : interfaces.removeItem(iface.id);

  const actions = useWgInterfaceActions({
    onChanged: upsert,
    onDeleted: iface => interfaces.removeItem(iface.id),
  });

  useSocketRoom("wg-interfaces", viewScope === "all" ? "all" : null, () =>
    interfaces.refresh(),
  );
  useSocketEvent<[WgInterfaceDto]>("wg:interface:updated", upsert, canView);
  useSocketEvent<[{ id: string }]>(
    "wg:interface:deleted",
    ({ id }) => interfaces.removeItem(id),
    canView,
  );

  return {
    canView,
    /** Закреплять обслуживающую копию: право на копии этого интерфейса. */
    canPin: (iface: WgInterfaceDto) => access.accessOf(iface).canReplicas,
    accessKey: access.accessKey,
    interfaces,
    pin: actions.pinReplica,
  };
};

export type RelayedInterfacesVM = ReturnType<typeof useRelayedInterfacesVM>;
