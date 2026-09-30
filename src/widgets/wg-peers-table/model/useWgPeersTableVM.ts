import { IUserStore } from "@entities/user";
import { type IWgPeerLive, WG_PERMISSIONS, wgPeerOwners } from "@entities/wg";
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

/** Действия над конкретным пиром по области прав. */
export interface IWgPeerRowAccess {
  canUpdate: boolean;
  canDelete: boolean;
  canPsk: boolean;
  canToggle: boolean;
}

/** Список пиров с фильтрами (снаружи: адрес страницы или страница интерфейса). */
export const useWgPeersTableVM = (filters: IWgPeersFilters) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const confirm = useConfirm();
  const config = useWgPeerConfigVM();
  const viewScope = userStore.scope(WG_PERMISSIONS.PEER_VIEW);
  const canViewAll = viewScope === "all";
  const canView = viewScope !== null;
  const canViewStats = userStore.scope(WG_PERMISSIONS.STATS_VIEW) === "all";
  const canCreate = userStore.can(WG_PERMISSIONS.PEER_CREATE);
  const currentUserId = userStore.user?.id ?? null;

  const accessOf = (peer: WgPeerDto): IWgPeerRowAccess => {
    const owners = wgPeerOwners(peer);

    return {
      canUpdate: userStore.canOn(WG_PERMISSIONS.PEER_UPDATE, owners),
      canDelete: userStore.canOn(WG_PERMISSIONS.PEER_DELETE, owners),
      canPsk: userStore.canOn(WG_PERMISSIONS.PEER_PSK, owners),
      canToggle: userStore.canOn(WG_PERMISSIONS.PEER_TOGGLE, owners),
    };
  };

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

  /**
   * Пир в области списка: с областью «свои» — только свои (держатель или
   * создатель), с фильтром «Мои» — тоже, плюс фильтры узла, интерфейса и
   * держателя.
   */
  const inScope = (
    peer: Pick<WgPeerDto, "userId" | "createdById" | "interfaceId" | "nodeId">,
  ) =>
    ((canViewAll && !filters.mine) ||
      (currentUserId !== null && wgPeerOwners(peer).includes(currentUserId))) &&
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

  // Все пиры — из комнаты списка, свои — адресно держателю и создателю.
  useSocketRoom("wg-peers", canViewAll ? "all" : null, () =>
    peers.reload({ refresh: true }),
  );
  // Живая статистика всех пиров — из комнаты обзора (право на статистику).
  useSocketRoom("wg-overview", canViewAll && canViewStats ? "all" : null);
  // Область «свои» — статистика своих пиров из комнаты «мои пиры».
  useSocketRoom("wg-peers-own", !canViewAll && canView ? currentUserId : null);
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

  useCloseWhenForbidden(
    form.open,
    form.editing ? accessOf(form.editing).canUpdate : canCreate,
    () => form.setOpen(false),
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
    /** Действия над пиром: право на все или свой пир. */
    accessOf,
    /** Меняется вместе с правами — колонки таблицы пересобираются по нему. */
    accessKey: userStore.accessKey,
  };
};

export type WgPeersTableVM = ReturnType<typeof useWgPeersTableVM>;
