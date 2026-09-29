import { IUserStore } from "@entities/user";
import { type IWgPeerLive, WG_PERMISSIONS } from "@entities/wg";
import { useWgPeerFormVM } from "@features/manage-wg-peer";
import { useWgPeerConfigVM } from "@features/wg-peer-config";
import { IMainApi } from "@shared/api";
import type { ListWgPeersParams, WgPeerDto } from "@shared/api/gen/main/model";
import { usePaged } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useConfirm } from "@shared/ui";
import { useRef } from "react";

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
  const canViewStats = userStore.can(WG_PERMISSIONS.STATS_VIEW);
  const canCreate = userStore.can(WG_PERMISSIONS.PEER_CREATE);
  const canUpdate = userStore.can(WG_PERMISSIONS.PEER_UPDATE);
  const canToggleAny = userStore.can(WG_PERMISSIONS.PEER_TOGGLE);
  const isOwnPeerAllowed = userStore.can(WG_PERMISSIONS.PEER_OWN);

  // Фильтры — аргумент watch: их смена перезапрашивает список.
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

  /** Пир в области списка: держателю — только свои, плюс фильтры узла, интерфейса и владельца. */
  const inScope = (
    peer: Pick<WgPeerDto, "userId" | "interfaceId" | "nodeId">,
  ) =>
    (canViewAll || peer.userId === userStore.user?.id) &&
    (!filters.userId || peer.userId === filters.userId) &&
    (!filters.nodeId || peer.nodeId === filters.nodeId) &&
    (!filters.interfaceId || peer.interfaceId === filters.interfaceId);

  /** Пир проходит фильтры онлайна. */
  const matchesOnline = (online: boolean) =>
    filters.online === undefined || online === filters.online;

  /** Пир относится к списку: область плюс фильтры включённости и онлайна. */
  const belongsToList = (peer: WgPeerDto) =>
    inScope(peer) &&
    (filters.enabled === undefined || peer.enabled === filters.enabled) &&
    matchesOnline(peer.isOnline);

  /** Изменённый пир: обновить в списке, убрать ушедший, перезапросить новый. */
  const applyUpdate = (peer: WgPeerDto) => {
    const isListed = peers.items.some(item => item.id === peer.id);

    if (!belongsToList(peer)) {
      if (isListed) peers.removeItem(peer.id);
    } else if (isListed) {
      peers.updateItem(peer.id, peer);
    } else {
      void peers.reload({ refresh: true });
    }
  };

  // Все пиры — из комнаты списка, свои — адресно держателю.
  useSocketRoom("wg-peers", canViewAll ? "all" : null, () =>
    peers.reload({ refresh: true }),
  );
  // Живая статистика всех пиров — из комнаты обзора (право на статистику).
  useSocketRoom("wg-overview", canViewAll && canViewStats ? "all" : null);
  // Держатель — статистика своих пиров из комнаты «мои пиры».
  useSocketRoom(
    "wg-peers-own",
    !canViewAll && canView ? (userStore.user?.id ?? null) : null,
  );
  useSocketEvent<[WgPeerDto]>("wg:peer:updated", applyUpdate, canView);
  useSocketEvent<[{ id: string }]>(
    "wg:peer:deleted",
    ({ id }) => peers.removeItem(id),
    canView,
  );
  // Последний известный онлайн пиров вне списка — чтобы заметить переход под фильтр.
  const lastOnline = useRef(new Map<string, boolean>());

  const applyLive = (lives: IWgPeerLive[]) => {
    const byId = new Map(lives.map(live => [live.peerId, live]));
    const listed = new Map(peers.items.map(item => [item.id, item]));
    const leaving = lives.filter(live => {
      const item = listed.get(live.peerId);

      return (
        item && item.isOnline !== live.online && !matchesOnline(live.online)
      );
    });
    const arrived =
      filters.online !== undefined &&
      lives.some(live => {
        const prev = lastOnline.current.get(live.peerId);

        return (
          !listed.has(live.peerId) &&
          prev !== undefined &&
          prev !== live.online &&
          matchesOnline(live.online) &&
          inScope(live)
        );
      });

    lives.forEach(live => lastOnline.current.set(live.peerId, live.online));

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
    leaving.forEach(live => peers.removeItem(live.peerId));
    if (arrived) void peers.reload({ refresh: true });
  };

  // Живая статистика пиров — пачкой за тик (комнаты интерфейса, обзора или
  // «мои пиры»).
  useSocketEvent<[{ peers: IWgPeerLive[] }]>(
    "wg:peers:stats",
    ({ peers: lives }) => applyLive(lives),
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

  useCloseWhenForbidden(form.open, form.editing ? canUpdate : canCreate, () =>
    form.setOpen(false),
  );

  return {
    peers,
    config,
    toggle,
    rotatePsk,
    remove,
    form,
    canView,
    canViewAll,
    canCreate,
    canUpdate,
    canDelete: userStore.can(WG_PERMISSIONS.PEER_DELETE),
    canPsk: userStore.can(WG_PERMISSIONS.PEER_PSK),
    /** Включать и выключать любой пир. */
    canToggleAny,
    /** Включать и выключать свои пиры (держатель). */
    canToggleOwn: isOwnPeerAllowed,
    currentUserId: userStore.user?.id ?? null,
  };
};

export type WgPeersTableVM = ReturnType<typeof useWgPeersTableVM>;
