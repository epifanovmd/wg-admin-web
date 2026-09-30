import { IUserStore } from "@entities/user";
import {
  type IWgPeerLive,
  useWgLiveSpeed,
  WG_PERMISSIONS,
  wgPeerOwners,
} from "@entities/wg";
import { useWgPeerFormVM } from "@features/manage-wg-peer";
import { useWgPeerConfigVM } from "@features/wg-peer-config";
import { IMainApi } from "@shared/api";
import type { IWgSeriesDto, WgPeerDto } from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { useCloseWhenForbidden } from "@shared/lib/hooks";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useNavigate } from "@tanstack/react-router";

/**
 * Карточка пира: данные, live-скорость и трафик за сутки, конфиг и
 * управление. С областью «свои» — только свой пир (держатель или создатель);
 * действия — по области своих прав.
 */
export const useWgPeerDetailVM = (peerId: string) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const navigate = useNavigate();
  const viewScope = userStore.scope(WG_PERMISSIONS.PEER_VIEW);
  const canViewAll = viewScope === "all";
  const canView = viewScope !== null;
  const liveId = canView ? peerId : null;

  const peer = useEntity<WgPeerDto, string>({
    queryFn: id => api.getWgPeer(id),
    watch: [peerId],
    enabled: canView,
  });

  const history = useEntity<IWgSeriesDto[], string>({
    queryFn: id => api.wgStatsSeries({ peerId: id, groupBy: "peer" }),
    watch: [peerId],
    enabled: canView,
  });

  // Статистика пиров приходит пачкой за тик — берём свой.
  const speed = useWgLiveSpeed<IWgPeerLive, { peers: IWgPeerLive[] }>({
    id: liveId,
    event: "wg:peers:stats",
    select: ({ peers }, id) => peers.find(live => live.peerId === id),
    load: id => api.wgStatsCurrentPeer(id),
    loadWindow: id => api.wgStatsPeerWindow(id),
  });

  useSocketRoom("wg-peer", liveId, () => {
    void peer.refresh(peerId);
    void speed.reload();
  });
  /** Свой пир: держатель или создатель. */
  const isMine = (item: WgPeerDto) =>
    !!userStore.user && wgPeerOwners(item).includes(userStore.user.id);

  /** Пир удалён или больше не виден (ушёл к другому держателю). */
  const leave = (message: string) => {
    toast.warning(message);
    void navigate({ to: "/wg/peers" });
  };

  useSocketEvent<[WgPeerDto]>(
    "wg:peer:updated",
    updated => {
      if (updated.id !== peerId) return;
      if (!canViewAll && !isMine(updated)) {
        leave("Пир больше не закреплён за вами");
      } else {
        peer.setData(updated);
      }
    },
    canView,
  );
  useSocketEvent<[{ id: string }]>(
    "wg:peer:deleted",
    ({ id }) => {
      if (id === peerId) leave("Пир удалён или больше недоступен");
    },
    canView,
  );

  const owners = peer.data ? wgPeerOwners(peer.data) : [];
  const canUpdate =
    !!peer.data && userStore.canOn(WG_PERMISSIONS.PEER_UPDATE, owners);
  const config = useWgPeerConfigVM();
  const form = useWgPeerFormVM({ onSaved: peer.setData });

  useCloseWhenForbidden(form.open, canUpdate, () => form.setOpen(false));

  const toggle = async (): Promise<boolean> => {
    const current = peer.data;

    if (!current) return false;

    const res = current.enabled
      ? await api.disableWgPeer(current.id)
      : await api.enableWgPeer(current.id);

    if (res.error) {
      notifyApiError(toast, res.error);

      return false;
    }

    peer.setData(res.data);

    return true;
  };

  return {
    peer,
    live: speed.live,
    speedPoints: speed.points,
    historyPoints: history.data?.[0]?.points ?? [],
    isHistoryLoading: history.isLoading,
    config,
    form,
    toggle,
    canUpdate,
    /** Включать и выключать: право на все пиры или свой пир. */
    canToggle:
      !!peer.data && userStore.canOn(WG_PERMISSIONS.PEER_TOGGLE, owners),
  };
};

export type WgPeerDetailVM = ReturnType<typeof useWgPeerDetailVM>;
