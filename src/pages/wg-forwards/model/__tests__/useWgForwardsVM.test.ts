import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { WgForwardDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgForwardsVM } from "../useWgForwardsVM";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const forward = {
  id: "f1",
  name: "wg-server",
  route: "auto",
  enabled: true,
  path: "ipip",
} as WgForwardDto;
const api = {
  listWgForwards: vi.fn().mockResolvedValue({ data: { items: [forward] } }),
  updateWgForward: vi
    .fn()
    .mockImplementation(async (_id: string, body: object) => ({
      data: { ...forward, ...body },
    })),
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
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  vi.clearAllMocks();
});

describe("useWgForwardsVM", () => {
  it("загружает пробросы; смена маршрута и выключение — PATCH и обновление строки", async () => {
    const { result } = renderHook(() => useWgForwardsVM());

    await waitFor(() => expect(result.current.forwards.items).toHaveLength(1));

    await act(async () => {
      await result.current.setRoute(forward, "direct");
    });
    expect(api.updateWgForward).toHaveBeenCalledWith("f1", { route: "direct" });
    expect(result.current.forwards.items[0].route).toBe("direct");

    await act(async () => {
      await result.current.toggle(forward);
    });
    expect(api.updateWgForward).toHaveBeenLastCalledWith("f1", {
      enabled: false,
    });
  });

  it("смена активного маршрута и удаление приходят событиями, без опроса", async () => {
    const { result } = renderHook(() => useWgForwardsVM());

    await waitFor(() => expect(result.current.forwards.items).toHaveLength(1));

    act(() =>
      socket.fire("wg:forward:updated", { ...forward, activeRoute: "direct" }),
    );
    expect(result.current.forwards.items[0].activeRoute).toBe("direct");

    act(() => socket.fire("wg:forward:deleted", { id: "f1" }));
    expect(result.current.forwards.items).toHaveLength(0);
    expect(api.listWgForwards).toHaveBeenCalledOnce();
  });
});
