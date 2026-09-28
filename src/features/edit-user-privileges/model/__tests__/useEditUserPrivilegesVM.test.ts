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
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
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
});
