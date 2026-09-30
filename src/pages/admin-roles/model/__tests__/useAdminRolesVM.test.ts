import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { IRoleDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminRolesVM } from "../useAdminRolesVM";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const role = (id: string, name: string, permissions?: string[]) =>
  ({
    id,
    name,
    permissions: permissions?.map(p => ({ name: p })),
  }) as unknown as IRoleDto;

const api = { getRoles: vi.fn(), createRole: vi.fn() };

beforeEach(() => {
  api.getRoles.mockResolvedValue({ data: [role("r1", "user", ["a"])] });
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(createFakeSocket());
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer.bind(IUserStore.Tid).toConstantValue({
    user: { id: "admin" },
    isAdmin: true,
    can: () => true,
  });
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  vi.clearAllMocks();
});

describe("useAdminRolesVM", () => {
  it("новая роль без прав в ответе — в списке с пустым набором прав", async () => {
    api.createRole.mockResolvedValue({ data: role("r2", "moderator") });

    const { result, rerender } = renderHook(() => useAdminRolesVM());

    await waitFor(() => expect(api.getRoles).toHaveBeenCalled());
    await act(() => result.current.create({ name: "moderator" }));
    rerender();

    const created = result.current.roles.find(r => r.id === "r2");

    expect(created?.permissions).toEqual([]);
  });
});
