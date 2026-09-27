import { IUserStore } from "@entities/user";
import { IWgNodesStore } from "@entities/wg";
import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgEndpointsVM } from "../useWgEndpointsVM";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const endpoint = { id: "e1", name: "msk", host: "1.2.3.4" };
const api = {
  listWgEndpoints: vi
    .fn()
    .mockResolvedValue({ data: { items: [endpoint], total: 1 } }),
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
  iocContainer
    .bind(IWgNodesStore.Tid)
    .toConstantValue({ nodes: [], load: vi.fn().mockResolvedValue(undefined) });
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(IWgNodesStore.Tid);
});

describe("useWgEndpointsVM", () => {
  it("загружает точки при открытии страницы", async () => {
    // useCollection без watch/autoLoad сам не грузит.
    const { result } = renderHook(() => useWgEndpointsVM());

    await waitFor(() => expect(result.current.endpoints.items).toHaveLength(1));
    expect(api.listWgEndpoints).toHaveBeenCalledOnce();
  });

  it("события комнаты: новая и изменённая точка, удаление; после переподключения — перечитать", async () => {
    const { result } = renderHook(() => useWgEndpointsVM());

    await waitFor(() => expect(result.current.endpoints.items).toHaveLength(1));
    expect(socket.emitted[0].event).toBe("room:subscribe");
    expect(socket.emitted[0].args[0]).toEqual({
      type: "wg-endpoints",
      id: "all",
    });

    act(() => {
      socket.fire("wg:endpoint:updated", { ...endpoint, name: "msk-2" });
      socket.fire("wg:endpoint:updated", {
        id: "e2",
        name: "ams",
        host: "5.6.7.8",
      });
    });
    expect(result.current.endpoints.items.map(e => e.name)).toEqual([
      "msk-2",
      "ams",
    ]);

    act(() => socket.fire("wg:endpoint:deleted", { id: "e1" }));
    expect(result.current.endpoints.items.map(e => e.id)).toEqual(["e2"]);

    const loads = api.listWgEndpoints.mock.calls.length;

    await act(async () => socket.reconnect());
    expect(api.listWgEndpoints).toHaveBeenCalledTimes(loads + 1);
  });
});
