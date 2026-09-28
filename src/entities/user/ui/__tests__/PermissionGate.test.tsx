import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IUserStore } from "../../model/types";
import { PermissionGate } from "../PermissionGate";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigate }));

const toast = { warning: vi.fn(), error: vi.fn(), success: vi.fn() };
const state = observable({
  user: { id: "u1" } as { id: string } | null,
  error: undefined as string | undefined,
  permissions: [] as string[],
});

beforeEach(() => {
  runInAction(() => {
    state.user = { id: "u1" };
    state.error = undefined;
    state.permissions = [];
  });
  iocContainer.bind(IUserStore.Tid).toConstantValue({
    get user() {
      return state.user;
    },
    get error() {
      return state.error;
    },
    can: (permission: string) => state.permissions.includes(permission),
  });
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
});

afterEach(() => {
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

describe("PermissionGate", () => {
  it("со списком прав пускает по любому из них", () => {
    runInAction(() => (state.permissions = ["b"]));
    render(<PermissionGate permission={["a", "b"]}>содержимое</PermissionGate>);

    expect(screen.getByText("содержимое")).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("без права — заглушка, уведомление и уход на главную", () => {
    render(<PermissionGate permission="a">содержимое</PermissionGate>);

    expect(screen.queryByText("содержимое")).toBeNull();
    expect(screen.getByText("Нет доступа")).toBeTruthy();
    expect(toast.warning).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith({ to: "/", replace: true });
  });

  it("право отозвали на открытой странице — содержимое скрывается, уход на главную", () => {
    runInAction(() => (state.permissions = ["a"]));
    render(<PermissionGate permission="a">содержимое</PermissionGate>);
    expect(screen.getByText("содержимое")).toBeTruthy();

    act(() => runInAction(() => (state.permissions = [])));

    expect(screen.queryByText("содержимое")).toBeNull();
    expect(navigate).toHaveBeenCalledWith({ to: "/", replace: true });
  });

  it("пользователь не загрузился — ошибка вместо вечной проверки доступа", () => {
    runInAction(() => {
      state.user = null;
      state.error = "Сеть недоступна";
    });
    render(<PermissionGate permission="a">содержимое</PermissionGate>);

    expect(screen.getByText("Сеть недоступна")).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });
});
