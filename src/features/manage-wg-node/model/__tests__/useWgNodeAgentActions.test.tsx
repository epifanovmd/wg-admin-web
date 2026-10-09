import { IMainApi } from "@shared/api";
import type { IAgentWorkerDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ModalProvider } from "@shared/ui";
import {
  act,
  fireEvent,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWgNodeAgentActions } from "../useWgNodeAgentActions";

const toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
const api = {
  updateWgNodeWorker: vi.fn(),
  restartWgNodeWorker: vi.fn(),
  updateWgNodeAgent: vi.fn(),
};
const worker: IAgentWorkerDto = {
  name: "wg",
  state: "running",
  version: "1.0.0",
  release: true,
  health: { ok: true, busy: true },
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <ModalProvider>{children}</ModalProvider>
);

const confirmWith = async (label: string) =>
  fireEvent.click(await screen.findByRole("button", { name: label }));

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

describe("useWgNodeAgentActions", () => {
  it("занятый воркер — замена отложена: сообщение об ожидании", async () => {
    api.updateWgNodeWorker.mockResolvedValue({
      data: { deferred: true, pending: "update", actionId: "x1" },
    });
    const onChanged = vi.fn();
    const { result } = renderHook(
      () => useWgNodeAgentActions({ nodeId: "n1", onChanged }),
      { wrapper },
    );

    let done: Promise<void> = Promise.resolve();

    act(() => {
      done = result.current.update(worker, "1.1.0");
    });
    await confirmWith("Обновить");
    await act(() => done);

    expect(api.updateWgNodeWorker).toHaveBeenCalledWith("n1", "wg", {
      force: false,
    });
    expect(toast.info).toHaveBeenCalledWith(
      "Воркер «wg» занят — агент заменит его, когда освободится",
    );
    expect(toast.success).not.toHaveBeenCalled();
    expect(onChanged).toHaveBeenCalledOnce();
  });

  it("заменить сейчас: ожидает обновление — обновление с force", async () => {
    api.updateWgNodeWorker.mockResolvedValue({
      data: { deferred: false, version: "1.1.0", previous: "1.0.0" },
    });
    const { result } = renderHook(
      () => useWgNodeAgentActions({ nodeId: "n1" }),
      { wrapper },
    );

    let done: Promise<void> = Promise.resolve();

    act(() => {
      done = result.current.replaceNow({ ...worker, pending: "update" }, null);
    });
    await confirmWith("Обновить");
    await act(() => done);

    expect(api.updateWgNodeWorker).toHaveBeenCalledWith("n1", "wg", {
      force: true,
    });
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Воркер «wg» работает на версии 1.1.0",
      ),
    );
  });

  it("обновление агента ноды — версия в сообщении", async () => {
    api.updateWgNodeAgent.mockResolvedValue({
      data: { version: "1.0.1", previous: "1.0.0" },
    });
    const { result } = renderHook(
      () => useWgNodeAgentActions({ nodeId: "n1" }),
      { wrapper },
    );

    let done: Promise<void> = Promise.resolve();

    act(() => {
      done = result.current.updateAgent("1.0.0", "1.0.1");
    });
    await confirmWith("Обновить");
    await act(() => done);

    expect(api.updateWgNodeAgent).toHaveBeenCalledWith("n1");
    expect(toast.success).toHaveBeenCalledWith(
      "Агент работает на версии 1.0.1",
    );
  });
});
