import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { WgSocksServiceDto } from "@shared/api/gen/main/model";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgSocksVM } from "../useWgSocksVM";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const service = {
  id: "s1",
  name: "telegram",
  users: [],
  clients: [],
  live: null,
} as unknown as WgSocksServiceDto;
const api = { listWgSocks: vi.fn().mockResolvedValue({ data: [service] }) };
let socket: IFakeSocket;

beforeEach(() => {
  socket = createFakeSocket();
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue(createFakeAccess({ permissions: ["*"] }));
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  vi.clearAllMocks();
});

describe("useWgSocksVM", () => {
  it("изменения, статистика и удаление прокси — событиями комнаты", async () => {
    const { result } = renderHook(() => useWgSocksVM());

    await waitFor(() => expect(result.current.services.items).toHaveLength(1));
    expect(socket.emitted[0].event).toBe("room:subscribe");
    expect(socket.emitted[0].args[0]).toEqual({ type: "wg-socks", id: "all" });

    act(() =>
      socket.fire("wg:socks:updated", {
        ...service,
        users: [{ id: "u1", username: "tg", enabled: true }],
      }),
    );
    expect(result.current.services.items[0].users).toHaveLength(1);

    const live = { connections: 3, rxBytes: 10, txBytes: 20, ts: "now" };

    act(() => socket.fire("wg:socks:stats", { id: "s1", live }));
    expect(result.current.services.items[0].live).toEqual(live);
    // Статистика не теряет остальные поля карточки.
    expect(result.current.services.items[0].users).toHaveLength(1);

    act(() => socket.fire("wg:socks:deleted", { id: "s1" }));
    expect(result.current.services.items).toHaveLength(0);
  });
});
