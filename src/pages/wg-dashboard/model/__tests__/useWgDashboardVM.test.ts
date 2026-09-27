import { IUserStore } from "@entities/user";
import { IWgNodesStore, WG_PERMISSIONS } from "@entities/wg";
import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { renderHook, waitFor } from "@testing-library/react";
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
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer.bind(IUserStore.Tid).toConstantValue({
    user: { id: "u1" },
    can: (permission: string) => permissions.includes(permission),
  });
  iocContainer.bind(IWgNodesStore.Tid).toConstantValue({
    nodes: [],
    load: vi.fn().mockResolvedValue(undefined),
    upsert: vi.fn(),
  });
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
    ["пользователь VPN", [WG_PERMISSIONS.STATS_OWN, WG_PERMISSIONS.PEER_OWN]],
  ])("%s сразу видит сводку, не дожидаясь событий", async (_, permissions) => {
    bind(permissions);
    const { result } = renderHook(() => useWgDashboardVM());

    await waitFor(() => expect(result.current.overview?.peers.total).toBe(5));
    expect(api.wgStatsOverview).toHaveBeenCalledOnce();
  });
});
