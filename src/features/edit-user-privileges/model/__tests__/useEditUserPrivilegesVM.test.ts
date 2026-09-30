import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import type { UserDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useEditUserPrivilegesVM } from "../useEditUserPrivilegesVM";

const user = {
  id: "u1",
  roles: [{ id: "r1", name: "user" }],
  directPermissions: [],
} as unknown as UserDto;
const api = {
  getRoles: vi.fn().mockResolvedValue({ data: [] }),
  setPrivileges: vi.fn().mockResolvedValue({ data: user }),
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), success: vi.fn() });
  iocContainer.bind(IUserStore.Tid).toConstantValue({ can: () => true });
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IUserStore.Tid);
  vi.clearAllMocks();
});

describe("useEditUserPrivilegesVM", () => {
  it("сохраняет права пользователя, открытого после первого рендера", async () => {
    const onSaved = vi.fn();
    const { result, rerender } = renderHook(
      ({ current }: { current: UserDto | null }) =>
        useEditUserPrivilegesVM({ user: current, onSaved }),
      { initialProps: { current: null as UserDto | null } },
    );

    rerender({ current: user });
    act(() => result.current.toggleRole("admin", true));
    await act(async () => {
      await result.current.save();
    });

    expect(api.setPrivileges).toHaveBeenCalledWith("u1", {
      roles: ["user", "admin"],
      permissions: [],
    });
    expect(onSaved).toHaveBeenCalledWith(user);
  });

  it("последнюю роль снять нельзя, при нескольких — можно", () => {
    const { result } = renderHook(() =>
      useEditUserPrivilegesVM({ user, onSaved: vi.fn() }),
    );

    expect(result.current.canToggleRole("user")).toBe(false);
    expect(result.current.canToggleRole("admin")).toBe(true);

    act(() => result.current.toggleRole("admin", true));

    expect(result.current.canToggleRole("user")).toBe(true);
  });

  it("права задаются набором целиком", () => {
    const { result } = renderHook(() =>
      useEditUserPrivilegesVM({ user, onSaved: vi.fn() }),
    );

    act(() => result.current.setPermissions(["wg:peer:view:own"]));

    expect(result.current.permissions).toEqual(["wg:peer:view:own"]);
  });

  it("без права просмотра ролей — роли не грузятся и не меняются", () => {
    iocContainer.rebind(IUserStore.Tid).toConstantValue({ can: () => false });

    const { result } = renderHook(() =>
      useEditUserPrivilegesVM({ user, onSaved: vi.fn() }),
    );

    expect(api.getRoles).not.toHaveBeenCalled();
    expect(result.current.roleOptions).toEqual(["user"]);
    expect(result.current.canEditRoles).toBe(false);
  });
});
