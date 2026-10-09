import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useWorkerActionResults } from "../useWorkerActionResults";

const toast = { error: vi.fn(), success: vi.fn() };
let socket = createFakeSocket();

const action = (patch: Record<string, unknown> = {}) => ({
  id: "x1",
  agentId: "a1",
  name: "worker.update",
  args: { name: "wg" },
  status: "done",
  result: { version: "1.1.0" },
  createdAt: 1,
  finishedAt: 2,
  deferred: true,
  ...patch,
});

beforeEach(() => {
  socket = createFakeSocket();
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(INotificationService.Tid).toConstantValue(toast);
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

describe("useWorkerActionResults", () => {
  it("итог отложенной замены — тост и перечитать агента", () => {
    const onSettled = vi.fn();

    renderHook(() => useWorkerActionResults("a1", onSettled));
    act(() => socket.fire("agent:action", action()));

    expect(toast.success).toHaveBeenCalledWith(
      "Воркер «wg» обновлён: версия 1.1.0",
    );
    expect(onSettled).toHaveBeenCalledOnce();
  });

  it("отказ — ошибка с текстом агента", () => {
    renderHook(() => useWorkerActionResults("a1"));
    act(() =>
      socket.fire(
        "agent:action",
        action({
          name: "worker.restart",
          status: "failed",
          error: { code: "X", message: "не запустился" },
        }),
      ),
    );

    expect(toast.error).toHaveBeenCalledWith("не запустился", {
      title: "Воркер «wg» не перезапущен",
    });
  });

  it("не отложенное, чужой агент или другое действие — без тоста", () => {
    renderHook(() => useWorkerActionResults("a1"));
    act(() => {
      socket.fire("agent:action", action({ deferred: false }));
      socket.fire("agent:action", action({ agentId: "a2" }));
      socket.fire("agent:action", action({ name: "agent.update" }));
    });

    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
