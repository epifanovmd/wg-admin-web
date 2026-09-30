import { IMainApi } from "@shared/api";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAssignWgOwnerVM } from "../useAssignWgOwnerVM";

const api = {
  getUserOptions: vi
    .fn()
    .mockResolvedValue({ data: { data: [{ id: "u2", name: "Блохин" }] } }),
};
const toast = { error: vi.fn(), success: vi.fn() };

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

const target = (ownerId: string | null) => ({
  title: "Нода alpha",
  ownerId,
  assign: vi.fn().mockResolvedValue({ data: { id: "n1", ownerId: "u2" } }),
  revoke: vi.fn().mockResolvedValue({ data: { id: "n1", ownerId: null } }),
});

describe("useAssignWgOwnerVM", () => {
  it("назначает выбранного пользователя и закрывается", async () => {
    const onSaved = vi.fn();
    const next = target(null);
    const { result, rerender } = renderHook(() =>
      useAssignWgOwnerVM({ onSaved }),
    );

    act(() => result.current.openFor(next));
    await waitFor(() => expect(api.getUserOptions).toHaveBeenCalled());
    rerender();
    await waitFor(() =>
      expect(result.current.userOptions).toEqual([
        { value: "u2", label: "Блохин" },
      ]),
    );
    act(() => result.current.setUserId("u2"));
    await act(() => result.current.save());

    expect(next.assign).toHaveBeenCalledWith("u2");
    expect(onSaved).toHaveBeenCalledWith({ id: "n1", ownerId: "u2" });
    expect(result.current.target).toBeNull();
  });

  it("пустой выбор снимает владельца", async () => {
    const next = target("u2");
    const { result } = renderHook(() =>
      useAssignWgOwnerVM({ onSaved: vi.fn() }),
    );

    act(() => result.current.openFor(next));
    act(() => result.current.setUserId(null));
    await act(() => result.current.save());

    expect(next.revoke).toHaveBeenCalledOnce();
  });

  it("без изменений — без запроса", async () => {
    const next = target("u2");
    const { result } = renderHook(() =>
      useAssignWgOwnerVM({ onSaved: vi.fn() }),
    );

    act(() => result.current.openFor(next));
    await act(() => result.current.save());

    expect(next.assign).not.toHaveBeenCalled();
    expect(next.revoke).not.toHaveBeenCalled();
    expect(result.current.target).toBeNull();
  });

  it("ошибка — уведомление, окно остаётся открытым", async () => {
    const next = {
      ...target(null),
      assign: vi.fn().mockResolvedValue({ error: { message: "нет" } }),
    };
    const { result } = renderHook(() =>
      useAssignWgOwnerVM({ onSaved: vi.fn() }),
    );

    act(() => result.current.openFor(next));
    act(() => result.current.setUserId("u2"));
    await act(() => result.current.save());

    expect(toast.error).toHaveBeenCalled();
    expect(result.current.target).not.toBeNull();
  });
});
