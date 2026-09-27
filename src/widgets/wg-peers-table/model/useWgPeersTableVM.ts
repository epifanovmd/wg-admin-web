import { IUserStore } from "@entities/user";
import { type IWgPeerLive, WG_PERMISSIONS } from "@entities/wg";
import { useWgPeerFormVM } from "@features/manage-wg-peer";
import { useWgPeerConfigVM } from "@features/wg-peer-config";
import { IMainApi } from "@shared/api";
import type { ListWgPeersParams, WgPeerDto } from "@shared/api/gen/main/model";
import { usePaged } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useConfirm } from "@shared/ui";

import { compactPeersFilters, type IWgPeersFilters } from "./types";

const PAGE_SIZE = 20;

/** Список пиров с фильтрами (снаружи: адрес страницы или страница интерфейса). */
export const useWgPeersTableVM = (filters: IWgPeersFilters) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const confirm = useConfirm();
  const config = useWgPeerConfigVM();
  const canViewAll = userStore.can(WG_PERMISSIONS.PEER_VIEW);
  const canView = canViewAll || userStore.can(WG_PERMISSIONS.PEER_OWN);

  // Холдер создаётся один раз: фильтры приходят аргументом из watch, а не
  // из замыкания первого рендера.
  const params = JSON.stringify(compactPeersFilters(filters));

  const peers = usePaged<WgPeerDto, string>({
    pageSize: PAGE_SIZE,
    keyExtractor: peer => peer.id,
    watch: [params],
    enabled: canView,
    queryFn: async ({ offset, limit }, rawParams) => {
      const { data, error } = await api.listWgPeers({
        offset,
        limit,
        ...(JSON.parse(rawParams) as ListWgPeersParams),
      });

      return {
        data: data ? { data: data.items, totalCount: data.total } : null,
        error,
      };
    },
  });

  const updateIfListed = (peer: WgPeerDto) => {
    if (peers.items.some(item => item.id === peer.id)) {
      peers.updateItem(peer.id, peer);
    }
  };

  // Админ получает изменения из комнаты overview, держатель — адресно.
  useSocketRoom("wg-overview", canViewAll ? "all" : null, () =>
    peers.reload({ refresh: true }),
  );
  useSocketEvent<[WgPeerDto]>("wg:peer:updated", updateIfListed, canView);
  useSocketEvent<[{ id: string }]>(
    "wg:peer:deleted",
    ({ id }) => peers.removeItem(id),
    canView,
  );
  const applyLive = (lives: IWgPeerLive[]) => {
    const byId = new Map(lives.map(live => [live.peerId, live]));

    peers.updateItems(item => {
      const live = byId.get(item.id);

      if (
        !live ||
        (item.isOnline === live.online &&
          item.lastHandshakeAt === live.lastHandshakeAt &&
          item.lastEndpoint === live.endpoint &&
          item.rxBytesTotal === live.rxTotal &&
          item.txBytesTotal === live.txTotal)
      ) {
        return item;
      }

      return {
        ...item,
        isOnline: live.online,
        lastHandshakeAt: live.lastHandshakeAt,
        lastEndpoint: live.endpoint,
        rxBytesTotal: live.rxTotal,
        txBytesTotal: live.txTotal,
      };
    });
  };

  // Живая статистика: пачкой за тик — комнаты интерфейса и обзора; по пиру —
  // держателю адресно.
  useSocketEvent<[{ peers: IWgPeerLive[] }]>(
    "wg:peers:stats",
    ({ peers: lives }) => applyLive(lives),
    canView,
  );
  useSocketEvent<[IWgPeerLive]>(
    "wg:peer:stats",
    live => applyLive([live]),
    canView,
  );

  const form = useWgPeerFormVM({
    interfaceId: filters.interfaceId,
    onSaved: peer => {
      if (peers.items.some(item => item.id === peer.id)) {
        peers.updateItem(peer.id, peer);
      } else {
        void peers.reload({ refresh: true });
      }
    },
  });

  const toggle = async (peer: WgPeerDto): Promise<boolean> => {
    const res = peer.enabled
      ? await api.disableWgPeer(peer.id)
      : await api.enableWgPeer(peer.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    peers.updateItem(peer.id, res.data);

    return true;
  };

  const rotatePsk = async (peer: WgPeerDto) => {
    const ok = await confirm({
      title: `Перевыпустить preshared-ключ пира «${peer.name}»?`,
      description: "Клиенту потребуется новый конфиг.",
      confirmLabel: "Перевыпустить",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.rotateWgPeerPsk(peer.id);

    if (res.error) notifyApiError(toast, res.error);
    else {
      peers.updateItem(peer.id, res.data);
      toast.success("Скачайте новый конфиг", { title: "PSK перевыпущен" });
    }
  };

  const remove = async (peer: WgPeerDto) => {
    const ok = await confirm({
      title: `Удалить пир «${peer.name}»?`,
      description: "Клиент отключится сразу.",
      confirmLabel: "Удалить",
      confirmVariant: "destructive",
    });

    if (!ok) return;

    const res = await api.deleteWgPeer(peer.id);

    if (res.error) notifyApiError(toast, res.error);
    else await peers.reload({ refresh: true });
  };

  return {
    peers,
    config,
    toggle,
    rotatePsk,
    remove,
    form,
    canViewAll,
    canManage: userStore.can(WG_PERMISSIONS.PEER_MANAGE),
  };
};

export type WgPeersTableVM = ReturnType<typeof useWgPeersTableVM>;
