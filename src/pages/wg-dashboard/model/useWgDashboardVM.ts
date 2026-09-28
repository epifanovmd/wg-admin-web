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
  // Список нод на дашборде — при праве и на статистику, и на ноды.
  const canViewNodes = canViewGlobal && userStore.can(WG_PERMISSIONS.NODE_VIEW);
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
    if (canViewNodes) void nodesStore.load();
  }, [canViewNodes, nodesStore]);

  useSocketRoom("wg-overview", canViewGlobal ? OVERVIEW_ID : null, () => {
    void overview.reload();
  });
  useSocketRoom("wg-nodes", canViewNodes ? "all" : null, () => {
    void nodesStore.load();
  });
  useSocketEvent<[WgNodeDto]>(
    "wg:node:updated",
    nodesStore.upsert,
    canViewNodes,
  );
  useSocketEvent<[{ id: string }]>(
    "wg:node:deleted",
    ({ id }) => nodesStore.remove(id),
    canViewNodes,
  );
  useSocketEvent<[IWgNodeLive]>(
    "wg:node:stats",
    snapshot =>
      setNodeLive(prev => new Map(prev).set(snapshot.nodeId, snapshot)),
    canViewGlobal,
  );
  // Свой пир — обновить или перезапросить список (назначен только что),
  // переназначенный другому — убрать.
  useSocketEvent<[WgPeerDto]>(
    "wg:peer:updated",
    peer => {
      const isListed = myPeers.items.some(item => item.id === peer.id);

      if (peer.userId !== userStore.user?.id) {
        if (isListed) myPeers.removeItem(peer.id);
      } else if (isListed) {
        myPeers.updateItem(peer.id, peer);
      } else {
        void myPeers.refresh();
      }
    },
    !canViewGlobal,
  );
  useSocketEvent<[{ id: string }]>(
    "wg:peer:deleted",
    ({ id }) => myPeers.removeItem(id),
    !canViewGlobal,
  );

  return {
    canViewGlobal,
    overview: overview.live,
    speedPoints: overview.points,
    nodes: canViewNodes ? nodesStore.nodes : [],
    nodeLive,
    myPeers: myPeers.items,
    isMyPeersLoading: myPeers.isLoading,
    config,
  };
};

export type WgDashboardVM = ReturnType<typeof useWgDashboardVM>;
