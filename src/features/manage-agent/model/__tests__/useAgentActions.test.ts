import { IAgentsStore } from "@entities/agent";
import { IMainApi } from "@shared/api";
import type {
  AgentCommandDto,
  AgentDto,
  IAgentWorkerDto,
} from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAgentActions } from "../useAgentActions";
import { useWorkerActions } from "../useWorkerActions";

const confirm = vi.fn();

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => confirm,
}));

const agent = { id: "a-1", name: "node-01", version: "1.0.0" } as AgentDto;
const worker = (patch: Partial<IAgentWorkerDto> = {}): IAgentWorkerDto => ({
  name: "echo",
  state: "running",
  version: "1.0.0",
  release: true,
  restarts: 0,
  health: { ok: true },
  ...patch,
});

/** Поставленная команда и её итог. */
const queued = (type: string, patch: Partial<AgentCommandDto> = {}) => ({
  data: {
    id: "c-1",
    agentId: "a-1",
    type,
    status: "pending",
    createdAt: 1,
    ...patch,
  } as AgentCommandDto,
});
const done = (type: string, patch: Partial<AgentCommandDto> = {}) =>
  queued(type, { status: "done", ok: true, ...patch });

const api = {
  revokeAgent: vi.fn(),
  deleteAgent: vi.fn(),
  rotateAgentKey: vi.fn(),
  updateAgent: vi.fn(),
  restartAgentWorker: vi.fn(),
  updateAgentWorker: vi.fn(),
  getAgentCommand: vi.fn(),
};
const toast = { error: vi.fn(), success: vi.fn(), info: vi.fn() };
const store = {
  upsert: vi.fn(),
  remove: vi.fn(),
  fetch: vi.fn(),
  trackCommand: vi.fn(),
  settleCommand: vi.fn(),
  pendingCommand: vi.fn(),
};

beforeEach(() => {
  confirm.mockResolvedValue(true);
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
  iocContainer.bind(IAgentsStore.Tid).toConstantValue(store);
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(INotificationService.Tid);
  iocContainer.unbind(IAgentsStore.Tid);
  vi.clearAllMocks();
});

describe("useAgentActions", () => {
  it("отзыв: подтверждение, запрос и новый агент в сторе", async () => {
    const revoked = { ...agent, revoked: true };

    api.revokeAgent.mockResolvedValue({ data: revoked });

    const { result } = renderHook(() => useAgentActions());

    await act(() => result.current.revoke(agent));

    expect(confirm).toHaveBeenCalledWith(
      expect.objectContaining({ confirmVariant: "destructive" }),
    );
    expect(store.upsert).toHaveBeenCalledWith(revoked);
  });

  it("без подтверждения ничего не отправляется", async () => {
    confirm.mockResolvedValue(false);

    const { result } = renderHook(() => useAgentActions());

    await act(() => result.current.remove(agent));

    expect(api.deleteAgent).not.toHaveBeenCalled();
  });

  it("удаление убирает агента и сообщает наверх", async () => {
    const onDeleted = vi.fn();

    api.deleteAgent.mockResolvedValue({ data: undefined });

    const { result } = renderHook(() => useAgentActions({ onDeleted }));

    await act(() => result.current.remove(agent));

    expect(store.remove).toHaveBeenCalledWith("a-1");
    expect(onDeleted).toHaveBeenCalledWith(agent);
  });

  it("ошибка сервера показывается, агент остаётся", async () => {
    api.deleteAgent.mockResolvedValue({
      error: { message: "Удалить можно только отозванного агента" },
    });

    const onDeleted = vi.fn();
    const { result } = renderHook(() => useAgentActions({ onDeleted }));

    await act(() => result.current.remove(agent));

    expect(toast.error).toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it("смена ключа: команда агенту, итог — после ответа агента", async () => {
    api.rotateAgentKey.mockResolvedValue(queued("agent.rotateKey"));
    api.getAgentCommand.mockResolvedValue(done("agent.rotateKey"));

    const { result } = renderHook(() => useAgentActions());

    await act(() => result.current.rotateKey(agent));

    expect(store.trackCommand).toHaveBeenCalled();
    expect(api.getAgentCommand).toHaveBeenCalledWith(
      "a-1",
      "c-1",
      { waitSeconds: 25 },
      expect.anything(),
    );
    expect(store.settleCommand).toHaveBeenCalledWith("c-1");
    expect(toast.success).toHaveBeenCalledWith("Ключ агента «node-01» сменён");
  });

  it("обновление: версия в вопросе и в команде, итог — версия", async () => {
    api.updateAgent.mockResolvedValue(queued("agent.update"));
    api.getAgentCommand.mockResolvedValue(
      done("agent.update", { result: { version: "1.2.0", previous: "1.0.0" } }),
    );

    const { result } = renderHook(() => useAgentActions());

    await act(() => result.current.update(agent, "1.2.0"));
    expect(confirm).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: "Обновить агента «node-01» до версии 1.2.0?",
      }),
    );
    expect(api.updateAgent).toHaveBeenCalledWith("a-1", { version: "1.2.0" });
    expect(toast.success).toHaveBeenCalledWith(
      "Агент «node-01» работает на версии 1.2.0",
    );

    api.getAgentCommand.mockResolvedValue(
      done("agent.update", {
        ok: false,
        error: { code: "UPDATE_NOT_SUPPORTED", message: "агент в контейнере" },
      }),
    );
    await act(() => result.current.update(agent, null));
    expect(confirm).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: "Обновить агента «node-01» до новой версии?",
      }),
    );
    expect(api.updateAgent).toHaveBeenLastCalledWith("a-1", {});
    expect(toast.error).toHaveBeenCalledWith("агент в контейнере", {
      title: "Агент «node-01» не обновлён",
    });
  });
});

describe("useWorkerActions", () => {
  it("перезапуск — после подтверждения, итог — после ответа агента", async () => {
    api.restartAgentWorker.mockResolvedValue(queued("worker.restart"));
    api.getAgentCommand.mockResolvedValue(done("worker.restart"));
    confirm.mockResolvedValueOnce(false);

    const { result } = renderHook(() => useWorkerActions());

    await act(() => result.current.restart(agent, worker()));
    expect(api.restartAgentWorker).not.toHaveBeenCalled();

    await act(() => result.current.restart(agent, worker()));
    expect(api.restartAgentWorker).toHaveBeenCalledWith("a-1", "echo", {
      force: false,
    });
    expect(toast.success).toHaveBeenCalledWith("Воркер «echo» перезапущен");
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("занятый воркер: замена ждёт — предупреждение сразу, итог потом", async () => {
    api.restartAgentWorker.mockResolvedValue(queued("worker.restart"));
    api.getAgentCommand.mockResolvedValue(done("worker.restart"));

    const busy = worker({ health: { ok: true, busy: true } });
    const { result } = renderHook(() => useWorkerActions());

    await act(() => result.current.restart(agent, busy));
    expect(toast.info).toHaveBeenCalledWith(
      "Воркер «echo» занят — агент заменит его, когда освободится",
    );
    expect(toast.success).toHaveBeenCalledWith("Воркер «echo» перезапущен");
    expect(result.current.isBusy("restart", "echo")).toBe(false);
  });

  it("обновление: версия из итога; отказ агента — ошибка", async () => {
    api.updateAgentWorker.mockResolvedValue(queued("worker.update"));
    api.getAgentCommand
      .mockResolvedValueOnce(
        done("worker.update", { result: { version: "1.1.0" } }),
      )
      .mockResolvedValueOnce(
        done("worker.update", {
          ok: false,
          error: { code: "UPDATE_FAILED", message: "не запустился" },
        }),
      );

    const { result } = renderHook(() => useWorkerActions());

    await act(() => result.current.update(agent, worker(), "1.1.0"));
    expect(api.updateAgentWorker).toHaveBeenCalledWith("a-1", "echo", {
      force: false,
      version: "1.1.0",
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Воркер «echo» работает на версии 1.1.0",
    );

    await act(() => result.current.update(agent, worker(), "1.1.0"));
    expect(toast.error).toHaveBeenCalledWith("не запустился", {
      title: "Воркер «echo» не обновлён",
    });
  });

  it("заменить сейчас: ждущее обновление — обновление с force", async () => {
    api.updateAgentWorker.mockResolvedValue(queued("worker.update"));
    api.restartAgentWorker.mockResolvedValue(queued("worker.restart"));
    api.getAgentCommand.mockResolvedValue(done("worker.update"));

    const { result } = renderHook(() => useWorkerActions());

    await act(() =>
      result.current.replaceNow(agent, worker({ pending: "update" }), "1.1.0"),
    );
    expect(api.updateAgentWorker).toHaveBeenCalledWith("a-1", "echo", {
      force: true,
      version: "1.1.0",
    });
    expect(confirm).toHaveBeenLastCalledWith(
      expect.objectContaining({ confirmVariant: "destructive" }),
    );

    await act(() =>
      result.current.replaceNow(agent, worker({ pending: "restart" }), null),
    );
    expect(api.restartAgentWorker).toHaveBeenCalledWith("a-1", "echo", {
      force: true,
    });
  });

  it("заменить сейчас: ждущая команда, статус агента ещё не пришёл", async () => {
    api.updateAgentWorker.mockResolvedValue(queued("worker.update"));
    api.getAgentCommand.mockResolvedValue(done("worker.update"));
    store.pendingCommand.mockImplementation((_a, type) =>
      type === "worker.update" ? { id: "c-0" } : undefined,
    );

    const { result } = renderHook(() => useWorkerActions());

    await act(() => result.current.replaceNow(agent, worker(), "1.1.0"));
    expect(store.pendingCommand).toHaveBeenCalledWith(
      "a-1",
      "worker.update",
      "echo",
    );
    expect(api.updateAgentWorker).toHaveBeenCalledWith("a-1", "echo", {
      force: true,
      version: "1.1.0",
    });
  });

  it("ошибка постановки — уведомление, без итога", async () => {
    api.updateAgentWorker.mockResolvedValue({
      error: { message: "Сборки нет в каталоге" },
    });

    const { result } = renderHook(() => useWorkerActions());

    await act(() => result.current.update(agent, worker(), "1.1.0"));
    expect(toast.error).toHaveBeenCalledWith("Сборки нет в каталоге");
    expect(api.getAgentCommand).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
