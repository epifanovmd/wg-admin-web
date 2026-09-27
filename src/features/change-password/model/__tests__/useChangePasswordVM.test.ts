import { IUserStore } from "@entities/user";
import { iocContainer } from "@shared/lib/di";
import { HttpError, NetworkError } from "@shared/lib/http";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useChangePasswordVM } from "../useChangePasswordVM";

const setup = (error: unknown) => {
  const toast = { error: vi.fn(), success: vi.fn() };
  const userStore = {
    changePassword: vi.fn().mockResolvedValue({ data: null, error }),
  };

  iocContainer.bind(IUserStore.Tid).toConstantValue(userStore);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);

  const { result } = renderHook(() => useChangePasswordVM());

  return { toast, result };
};

const FORM = {
  currentPassword: "old-pass",
  newPassword: "new-pass",
  confirmPassword: "new-pass",
};

afterEach(() => {
  iocContainer.unbind(IUserStore.Tid);
  iocContainer.unbind(INotificationService.Tid);
});

describe("useChangePasswordVM", () => {
  it("неверный текущий пароль (4xx) — тост с сообщением сервера", async () => {
    const { toast, result } = setup(
      new HttpError({ status: 400, message: "Неверный текущий пароль" }),
    );

    await act(() => result.current.submit(FORM));

    expect(toast.error).toHaveBeenCalledWith("Неверный текущий пароль");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("нет сети — второго тоста нет, его показал notifyErrors", async () => {
    const { toast, result } = setup(new NetworkError());

    await act(() => result.current.submit(FORM));

    expect(toast.error).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
