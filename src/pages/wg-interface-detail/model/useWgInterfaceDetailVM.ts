import { IUserStore } from "@entities/user";
import {
  type IWgInterfaceLive,
  useWgLiveSpeed,
  WG_PERMISSIONS,
} from "@entities/wg";
import {
  useMoveWgInterfaceVM,
  useWgInterfaceActions,
  useWgInterfaceFormVM,
} from "@features/manage-wg-interface";
import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { useEntity } from "@shared/lib/holders";
import { useSocketEvent, useSocketRoom } from "@shared/lib/socket";
import { useNavigate } from "@tanstack/react-router";
import {
  compactPeersFilters,
  type IWgPeersFilters,
  useWgPeersTableVM,
} from "@widgets/wg-peers-table";
import { useState } from "react";

/**
 * Страница интерфейса: карточка, живая статистика и события комнаты
 * интерфейса, действия (как на странице ноды), пиры с фильтрами.
 */
export const useWgInterfaceDetailVM = (interfaceId: string) => {
  const api = IMainApi.useInstance();
  const userStore = IUserStore.useInstance();
  const navigate = useNavigate();
  const canView = userStore.can(WG_PERMISSIONS.INTERFACE_VIEW);
  const liveId = canView ? interfaceId : null;
  const [peerFilters, setPeerFilters] = useState<IWgPeersFilters>({});

  const iface = useEntity<WgInterfaceDto, string>({
    queryFn: id => api.getWgInterface(id),
    watch: [interfaceId],
    enabled: canView,
  });

  const peers = useWgPeersTableVM({ ...peerFilters, interfaceId });

  // Снимок для мгновенной отрисовки, дальше — события комнаты.
  const speed = useWgLiveSpeed<IWgInterfaceLive>({
    id: liveId,
    event: "wg:interface:stats",
    select: (snapshot, id) => (snapshot.interfaceId === id ? snapshot : null),
    load: id => api.wgStatsCurrentInterface(id),
    loadWindow: id => api.wgStatsInterfaceWindow(id),
  });

  const toNode = (nodeId: string) =>
    navigate({ to: "/wg/nodes/$nodeId", params: { nodeId } });

  useSocketRoom("wg-interface", liveId, () => {
    void iface.refresh(interfaceId);
    void speed.reload();
  });
  useSocketEvent<[WgInterfaceDto]>(
    "wg:interface:updated",
    updated => {
      if (updated.id === interfaceId) iface.setData(updated);
    },
    canView,
  );
  useSocketEvent<[{ id: string }]>(
    "wg:interface:deleted",
    ({ id }) => {
      const nodeId = iface.data?.nodeId;

      if (id === interfaceId && nodeId) void toNode(nodeId);
    },
    canView,
  );

  const actions = useWgInterfaceActions({
    onChanged: iface.setData,
    onDeleted: deleted => void toNode(deleted.nodeId),
  });
  const move = useMoveWgInterfaceVM({ onMoved: iface.setData });
  const form = useWgInterfaceFormVM({
    nodeId: iface.data?.nodeId ?? "",
    onSaved: iface.setData,
  });

  return {
    iface,
    live: speed.live,
    speedPoints: speed.points,
    actions,
    move,
    form,
    peers,
    peerFilters,
    setPeerFilters: (patch: Partial<IWgPeersFilters>) =>
      setPeerFilters(previous =>
        compactPeersFilters({ ...previous, ...patch }),
      ),
    canManage: userStore.can(WG_PERMISSIONS.INTERFACE_MANAGE),
  };
};

export type WgInterfaceDetailVM = ReturnType<typeof useWgInterfaceDetailVM>;
