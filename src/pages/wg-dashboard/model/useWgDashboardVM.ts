import { IUserStore } from "@entities/user";
import {
  type IWgNodeLive,
  IWgNodesStore,
  type IWgOverviewLive,
  useWgLiveSpeed,
  WG_PERMISSIONS,
} from "@entities/wg";
import { useWgPeerConfigVM } from "@features/wg-peer-config";
import { IMainApi } from "@shared/api";
import type { WgNodeDto, WgPeerDto } from "@shared/api/gen/main/model";
import { useCollection } from "@shared/lib/holders";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useEffect, useState } from "react";

/** Сводка обзора одна на пользователя: её «id» для live-хука. */
const OVERVIEW_ID = "all";

/**
 * Дашборд: сводка и скорость сети; администратору — ноды с live-скоростью,
 * пользователю VPN — свои подключения.
 */
export const useWgDashboardVM = () => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const nodesStore = IWgNodesStore.useInstance();
  const config = useWgPeerConfigVM();
  const canViewGlobal = userStore.can(WG_PERMISSIONS.STATS_VIEW);
  const [nodeLive, setNodeLive] = useState<Map<string, IWgNodeLive>>(
    () => new Map(),
  );

  // Сводка: снимок при открытии (у пользователя — по своим пирам), дальше —
  // события комнаты обзора.
  const overview = useWgLiveSpeed<IWgOverviewLive>({
    id: OVERVIEW_ID,
    event: "wg:stats:overview",
    load: () => api.wgStatsOverview(),
  });

  // Свои пиры — краткий список для пользователя VPN.
  const myPeers = useCollection<WgPeerDto>({
    queryFn: async () => {
      const { data, error } = await api.listWgPeers({ limit: 6 });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: peer => peer.id,
    autoLoad: true,
    enabled: !canViewGlobal,
  });

  useEffect(() => {
    if (canViewGlobal) void nodesStore.load();
  }, [canViewGlobal, nodesStore]);

  useSocketRoom("wg-overview", canViewGlobal ? OVERVIEW_ID : null, () => {
    void overview.reload();
    void nodesStore.load();
  });
  useSocketEvent<[WgNodeDto]>(
    "wg:node:updated",
    nodesStore.upsert,
    canViewGlobal,
  );
  useSocketEvent<[IWgNodeLive]>(
    "wg:node:stats",
    snapshot =>
      setNodeLive(prev => new Map(prev).set(snapshot.nodeId, snapshot)),
    canViewGlobal,
  );
  useSocketEvent<[WgPeerDto]>(
    "wg:peer:updated",
    peer => {
      if (myPeers.items.some(item => item.id === peer.id)) {
        myPeers.upsertItem(peer.id, peer);
      }
    },
    !canViewGlobal,
  );

  return {
    canViewGlobal,
    overview: overview.live,
    speedPoints: overview.points,
    nodes: nodesStore.nodes,
    nodeLive,
    myPeers: myPeers.items,
    isMyPeersLoading: myPeers.isLoading,
    config,
  };
};

export type WgDashboardVM = ReturnType<typeof useWgDashboardVM>;
