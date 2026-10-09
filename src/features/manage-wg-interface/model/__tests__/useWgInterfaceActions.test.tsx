import { IMainApi } from "@shared/api";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ModalProvider } from "@shared/ui";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgInterfaceActions } from "../useWgInterfaceActions";

const toast = { error: vi.fn(), success: vi.fn(), warning: vi.fn() };
const api = { restartWgInterface: vi.fn() };
const iface = { id: "i1", name: "wg0" } as WgInterfaceDto;

const wrapper = ({ children }: { children: ReactNode }) => (
  <ModalProvider>{children}</ModalProvider>
);

const restart = async () => {
  const { result } = renderHook(
    () => useWgInterfaceActions({ onChanged: vi.fn(), onDeleted: vi.fn() }),
    { wrapper },
  );

  await act(() => result.current.restart(iface));
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

describe("useWgInterfaceActions.restart", () => {
  it("воркер поднял интерфейс — успех с состоянием", async () => {
    api.restartWgInterface.mockResolvedValue({
      data: { name: "wg0", status: "up" },
    });
    await restart();

    expect(toast.success).toHaveBeenCalledWith(
      "Интерфейс wg0 перезапущен: поднят",
    );
  });

  it("интерфейс не поднялся — предупреждение", async () => {
    api.restartWgInterface.mockResolvedValue({
      data: { name: "wg0", status: "error" },
    });
    await restart();

    expect(toast.warning).toHaveBeenCalledWith(
      "Интерфейс wg0 перезапущен: ошибка",
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("незнакомое состояние — успех без пояснения", async () => {
    api.restartWgInterface.mockResolvedValue({
      data: { name: "wg0", status: "other" },
    });
    await restart();

    expect(toast.success).toHaveBeenCalledWith("Интерфейс wg0 перезапущен");
  });
});
