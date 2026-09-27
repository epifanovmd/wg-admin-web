import { IUserStore } from "@entities/user";
import { type IWgPeerLive, useWgLiveSpeed, WG_PERMISSIONS } from "@entities/wg";
import { useWgPeerFormVM } from "@features/manage-wg-peer";
import { useWgPeerConfigVM } from "@features/wg-peer-config";
import { IMainApi } from "@shared/api";
import type { IWgSeriesDto, WgPeerDto } from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { notifyApiError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";

/**
 * Карточка пира: данные, live-скорость и трафик за сутки, конфиг и
 * управление. Держатель видит свой пир (wg:peer:own), админ — любой.
 */
export const useWgPeerDetailVM = (peerId: string) => {
  const api = IMainApi.useInstance();
  const toast = INotificationService.useInstance();
  const userStore = IUserStore.useInstance();
  const canView =
    userStore.can(WG_PERMISSIONS.PEER_VIEW) ||
    userStore.can(WG_PERMISSIONS.PEER_OWN);
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

  const speed = useWgLiveSpeed<IWgPeerLive>({
    id: liveId,
    event: "wg:peer:stats",
    match: (snapshot, id) => snapshot.peerId === id,
    load: id => api.wgStatsCurrentPeer(id),
    loadWindow: id => api.wgStatsPeerWindow(id),
  });

  useSocketRoom("wg-peer", liveId, () => {
    void peer.refresh(peerId);
    void speed.reload();
  });
  useSocketEvent<[WgPeerDto]>(
    "wg:peer:updated",
    updated => {
      if (updated.id === peerId) peer.setData(updated);
    },
    canView,
  );

  const config = useWgPeerConfigVM();
  const form = useWgPeerFormVM({ onSaved: peer.setData });

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
    canManage: userStore.can(WG_PERMISSIONS.PEER_MANAGE),
  };
};

export type WgPeerDetailVM = ReturnType<typeof useWgPeerDetailVM>;
