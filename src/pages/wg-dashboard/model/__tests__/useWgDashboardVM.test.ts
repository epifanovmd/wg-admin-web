import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import { ownPermission } from "@shared/lib/access";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWgDashboardVM } from "../useWgDashboardVM";

const overview = {
  nodes: { online: 1, total: 2 },
  interfaces: { enabled: 1, total: 1 },
  peers: { online: 3, total: 5 },
  rxTotal: 0,
  txTotal: 0,
  rxBps: 0,
  txBps: 0,
  ts: new Date().toISOString(),
};

const api = {
  wgStatsOverview: vi.fn().mockResolvedValue({ data: overview }),
  listWgPeers: vi.fn().mockResolvedValue({ data: { items: [], total: 0 } }),
};

const bind = (permissions: string[]) => {
  const socket = createFakeSocket();

  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue(createFakeAccess({ permissions }));
  iocContainer.bind(IWgNodesStore.Tid).toConstantValue({
    nodes: [],
    load: vi.fn().mockResolvedValue(undefined),
    upsert: vi.fn(),
  });

  return socket;
};

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IWgNodesStore.Tid);
  vi.clearAllMocks();
});

describe("useWgDashboardVM", () => {
  it.each([
    ["администратор", [WG_PERMISSIONS.STATS_VIEW]],
    [
      "пользователь VPN",
      [
        ownPermission(WG_PERMISSIONS.STATS_VIEW),
        ownPermission(WG_PERMISSIONS.PEER_VIEW),
      ],
    ],
  ])("%s сразу видит сводку, не дожидаясь событий", async (_, permissions) => {
    bind(permissions);
    const { result } = renderHook(() => useWgDashboardVM());

    await waitFor(() => expect(result.current.overview?.peers.total).toBe(5));
    expect(api.wgStatsOverview).toHaveBeenCalledOnce();
  });

  it("свои подключения: назначенный пир появляется, ушедший — пропадает", async () => {
    const socket = bind([
      ownPermission(WG_PERMISSIONS.STATS_VIEW),
      ownPermission(WG_PERMISSIONS.PEER_VIEW),
    ]);
    const peer = { id: "p1", name: "iphone", userId: "u1" };
    const assigned = { id: "p2", name: "mac", userId: "u1" };

    api.listWgPeers.mockResolvedValueOnce({
      data: { items: [peer], total: 1 },
    });

    const { result, rerender } = renderHook(() => useWgDashboardVM());
    // VM отдаёт снимок items — перечитываем рендером.
    const myPeers = () => {
      rerender();

      return result.current.myPeers;
    };

    await waitFor(() => expect(myPeers()).toHaveLength(1));

    api.listWgPeers.mockResolvedValueOnce({
      data: { items: [peer, assigned], total: 2 },
    });
    act(() => socket.fire("wg:peer:updated", assigned));
    await waitFor(() => expect(myPeers()).toHaveLength(2));

    act(() => socket.fire("wg:peer:updated", { ...peer, userId: "u2" }));
    act(() => socket.fire("wg:peer:deleted", { id: "p2" }));
    expect(myPeers()).toHaveLength(0);
  });
});
