import { IUserStore } from "@entities/user";
import { IWgNodesStore } from "@entities/wg";
import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgInterfaceDetailVM } from "../useWgInterfaceDetailVM";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", async importOriginal => ({
  ...(await importOriginal<object>()),
  useNavigate: () => navigate,
}));
vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));
vi.mock("@features/wg-peer-config", () => ({
  useWgPeerConfigVM: () => ({ openFor: vi.fn() }),
}));

const iface = {
  id: "i1",
  nodeId: "n1",
  name: "wg0",
  enabled: false,
  replicas: [],
} as unknown as WgInterfaceDto;
const api = {
  getWgInterface: vi.fn().mockResolvedValue({ data: iface }),
  wgStatsCurrentInterface: vi.fn().mockResolvedValue({
    data: { interfaceId: "i1", peersOnline: 1, peersTotal: 47 },
  }),
  wgStatsInterfaceWindow: vi.fn().mockResolvedValue({ data: [] }),
  listWgPeers: vi.fn().mockResolvedValue({ data: { items: [], total: 0 } }),
};
let socket: IFakeSocket;

beforeEach(() => {
  socket = createFakeSocket();
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer.bind(IUserStore.Tid).toConstantValue({ can: () => true });
  iocContainer.bind(IWgNodesStore.Tid).toConstantValue({ options: vi.fn() });
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IWgNodesStore.Tid);
  vi.clearAllMocks();
});

describe("useWgInterfaceDetailVM", () => {
  it("карточка, снимок статистики и пиры только этого интерфейса", async () => {
    const { result } = renderHook(() => useWgInterfaceDetailVM("i1"));

    await waitFor(() => expect(result.current.iface.data?.name).toBe("wg0"));
    await waitFor(() => expect(result.current.live?.peersTotal).toBe(47));
    expect(socket.emitted.map(e => e.args[0])).toContainEqual({
      type: "wg-interface",
      id: "i1",
    });
    await waitFor(() =>
      expect(api.listWgPeers).toHaveBeenLastCalledWith(
        expect.objectContaining({ interfaceId: "i1" }),
      ),
    );

    // Фильтр страницы не может увести к пирам другого интерфейса.
    act(() => result.current.setPeerFilters({ enabled: true }));
    await waitFor(() =>
      expect(api.listWgPeers).toHaveBeenLastCalledWith(
        expect.objectContaining({ interfaceId: "i1", enabled: true }),
      ),
    );
  });

  it("события: изменение, живая статистика (график), удаление — на страницу ноды", async () => {
    const { result } = renderHook(() => useWgInterfaceDetailVM("i1"));

    await waitFor(() => expect(result.current.iface.data).toBeTruthy());

    act(() => socket.fire("wg:interface:updated", { ...iface, enabled: true }));
    expect(result.current.iface.data?.enabled).toBe(true);

    act(() =>
      socket.fire("wg:interface:stats", {
        interfaceId: "i1",
        rxBps: 100,
        txBps: 200,
        peersOnline: 5,
        peersTotal: 47,
        ts: new Date().toISOString(),
      }),
    );
    expect(result.current.live?.peersOnline).toBe(5);
    expect(result.current.speedPoints).toHaveLength(1);

    act(() => socket.fire("wg:interface:deleted", { id: "i1" }));
    expect(navigate).toHaveBeenCalledWith({
      to: "/wg/nodes/$nodeId",
      params: { nodeId: "n1" },
    });
  });
});
