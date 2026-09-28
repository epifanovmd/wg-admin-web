import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { UserDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminUsersVM } from "../useAdminUsersVM";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const user = (id: string, email: string) =>
  ({ id, email, roles: [], directPermissions: [] }) as unknown as UserDto;

const api = { getUsers: vi.fn() };
let socket: IFakeSocket;

const bind = (permissions: string[]) =>
  iocContainer.bind(IUserStore.Tid).toConstantValue({
    user: { id: "admin" },
    can: (permission: string) => permissions.includes(permission),
  });

beforeEach(() => {
  socket = createFakeSocket();
  api.getUsers.mockResolvedValue({
    data: { items: [user("u1", "a@x")], total: 1 },
  });
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  vi.clearAllMocks();
});

const rooms = () =>
  socket.emitted
    .filter(({ event }) => event === "room:subscribe")
    .map(({ args }) => (args[0] as { type: string }).type);

describe("useAdminUsersVM", () => {
  it("список живой: изменение — на месте, новый пользователь — перезапрос", async () => {
    bind(["user:view"]);

    const { result } = renderHook(() => useAdminUsersVM());

    await waitFor(() => expect(result.current.users.items).toHaveLength(1));
    expect(rooms()).toContain("users");

    act(() => socket.fire("user:updated", user("u1", "new@x")));
    expect(result.current.users.items[0].email).toBe("new@x");

    api.getUsers.mockResolvedValueOnce({
      data: { items: [user("u2", "b@x"), user("u1", "new@x")], total: 2 },
    });
    act(() => socket.fire("user:updated", user("u2", "b@x")));
    await waitFor(() => expect(result.current.users.items).toHaveLength(2));
  });

  it("действия — по своим правам", () => {
    bind(["user:view", "user:delete"]);

    const { result } = renderHook(() => useAdminUsersVM());

    expect(result.current.canDelete).toBe(true);
    expect(result.current.canEditPrivileges).toBe(false);
  });

  it("без права просмотра — ни запроса, ни комнаты", () => {
    bind([]);

    renderHook(() => useAdminUsersVM());

    expect(api.getUsers).not.toHaveBeenCalled();
    expect(rooms()).not.toContain("users");
  });
});
