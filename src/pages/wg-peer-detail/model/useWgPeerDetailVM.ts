import { IUserStore } from "@entities/user";
import { type IWgPeerLive, useWgLiveSpeed, WG_PERMISSIONS } from "@entities/wg";
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
 * управление. Держатель видит свой пир (wg:peer:own), админ — любой.
 */
export const useWgPeerDetailVM = (peerId: string) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const navigate = useNavigate();
  const canViewAll = userStore.can(WG_PERMISSIONS.PEER_VIEW);
  const canViewOwn = userStore.can(WG_PERMISSIONS.PEER_OWN);
  const canView = canViewAll || canViewOwn;
  const canUpdate = userStore.can(WG_PERMISSIONS.PEER_UPDATE);
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
  /** Пир удалён или больше не виден (ушёл к другому держателю). */
  const leave = (message: string) => {
    toast.warning(message);
    void navigate({ to: "/wg/peers" });
  };

  useSocketEvent<[WgPeerDto]>(
    "wg:peer:updated",
    updated => {
      if (updated.id !== peerId) return;
      if (!canViewAll && updated.userId !== userStore.user?.id) {
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
    /** Включать и выключать: любой пир по праву, свой — как держатель. */
    canToggle:
      userStore.can(WG_PERMISSIONS.PEER_TOGGLE) ||
      (canViewOwn && peer.data?.userId === userStore.user?.id),
  };
};

export type WgPeerDetailVM = ReturnType<typeof useWgPeerDetailVM>;
