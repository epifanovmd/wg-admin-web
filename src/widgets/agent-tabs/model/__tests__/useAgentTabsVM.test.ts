import { agentModule } from "@entities/agent";
import { IMainApi } from "@shared/api";
import type {
  AgentConfigDto,
  AgentDto,
  IAgentEventDto,
} from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAgentConfigsVM } from "../useAgentConfigsVM";
import { useAgentEventsVM } from "../useAgentEventsVM";
import { useAgentLogsVM } from "../useAgentLogsVM";
import { useAgentWorkersVM } from "../useAgentWorkersVM";

vi.mock("@shared/ui", async importOriginal => ({
  ...(await importOriginal<object>()),
  useConfirm: () => vi.fn(),
}));

const agent = {
  id: "a-1",
  name: "node-01",
  labels: {},
  online: true,
  revoked: false,
  enrolledAt: 1,
  alerts: [],
  metrics: { at: 1, workers: { echo: { done: 2 } } },
  workers: [
    {
      name: "echo",
      state: "running",
      release: true,
      restarts: 0,
      health: { ok: true, busy: true },
      manifest: {
        configs: [{ key: "settings", description: "Префикс" }],
        commands: [{ type: "echo.quick" }],
        events: [
          { type: "echo.done" },
          {
            type: "echo.started",
            description: "Воркер запущен",
            schema: { type: "object" },
          },
        ],
        requests: [],
      },
    },
    {
      name: "kv",
      state: "running",
      pending: "restart",
      release: false,
      restarts: 0,
      manifest: {
        configs: [],
        commands: [],
        events: [{ type: "kv.saved" }],
        requests: [],
      },
    },
  ],
} as unknown as AgentDto;

const event = (id: string, patch: Partial<IAgentEventDto> = {}) => ({
  id,
  agentId: "a-1",
  worker: "echo",
  type: "echo.done",
  at: Number(id),
  receivedAt: Number(id),
  ...patch,
});

const configEntry = (key: string, version: number): AgentConfigDto => ({
  agentId: "a-1",
  worker: "echo",
  key,
  version,
  state: "pending",
  data: { prefix: ">" },
  updatedAt: 1,
});

const api = {
  getAgents: vi.fn(),
  getAgentRelease: vi.fn(),
  getAgentMetrics: vi.fn(async () => ({ data: [] })),
  getAgentEvents: vi.fn(),
  getAgentConfigs: vi.fn(),
  getAgentLogs: vi.fn(),
};
let socket: IFakeSocket;

beforeEach(() => {
  socket = createFakeSocket();
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.load(agentModule);
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer
    .bind(INotificationService.Tid)
    .toConstantValue({ error: vi.fn(), info: vi.fn(), success: vi.fn() });
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unload(agentModule);
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(INotificationService.Tid);
  vi.clearAllMocks();
});

describe("useAgentEventsVM", () => {
  it("лента агента с фильтрами на сервере; события из сокета — по фильтру", async () => {
    api.getAgentEvents.mockResolvedValue({
      data: { items: [event("2"), event("1")], nextCursor: null },
    });

    const { result } = renderHook(() => useAgentEventsVM(agent));

    await waitFor(() => expect(result.current.feed.items).toHaveLength(2));
    expect(api.getAgentEvents).toHaveBeenLastCalledWith({
      agentId: "a-1",
      worker: undefined,
      type: undefined,
      cursor: undefined,
      limit: 50,
    });
    expect(result.current.workerOptions).toEqual(["echo", "kv"]);
    expect(result.current.typeOptions).toEqual([
      "command.progress",
      "echo.done",
      "echo.started",
      "kv.saved",
    ]);
    expect(result.current.declaration).toBeNull();

    act(() => result.current.setType("echo.started"));
    expect(result.current.declaration).toMatchObject({
      description: "Воркер запущен",
      schema: { type: "object" },
    });

    act(() => result.current.setWorker("kv"));
    await waitFor(() =>
      expect(api.getAgentEvents).toHaveBeenLastCalledWith(
        expect.objectContaining({ worker: "kv" }),
      ),
    );
    expect(result.current.typeOptions).toEqual(["kv.saved"]);

    act(() => socket.fire("agent:event", event("3", { worker: "echo" })));
    act(() => socket.fire("agent:event", event("4", { worker: "kv" })));
    act(() =>
      socket.fire("agent:event", event("5", { worker: "kv", agentId: "a-2" })),
    );
    expect(result.current.feed.items[0].id).toBe("4");
    expect(result.current.feed.items.some(item => item.id === "3")).toBe(false);
  });
});

describe("useAgentConfigsVM", () => {
  it("ключи из манифеста с заданными значениями; статус — из agent:config", async () => {
    api.getAgentConfigs.mockResolvedValue({
      data: [configEntry("settings", 3), configEntry("old", 1)],
    });

    const { result, rerender } = renderHook(() =>
      useAgentConfigsVM(agent, true),
    );

    await waitFor(() => {
      rerender();
      expect(result.current.groups[0].items).toHaveLength(2);
    });

    const [echo, kv] = result.current.groups;

    expect(echo.items.map(item => [item.key, !!item.manifest])).toEqual([
      ["settings", true],
      ["old", false],
    ]);
    expect(kv.items).toEqual([]);
    expect(result.current.groups.map(group => group.worker)).toEqual([
      "echo",
      "kv",
    ]);

    // Событие без значения: статус новый, значение прежнее.
    act(() =>
      socket.fire("agent:config", {
        ...configEntry("settings", 3),
        data: undefined,
        state: "applied",
      }),
    );
    rerender();
    expect(result.current.groups[0].items[0].entry).toMatchObject({
      state: "applied",
      data: { prefix: ">" },
    });

    // Неизвестный ключ — список перечитывается.
    act(() => socket.fire("agent:config", configEntry("fresh", 1)));
    expect(api.getAgentConfigs).toHaveBeenCalledTimes(2);
  });

  it("ключ удалён (deleted) — пропадает без перечитывания", async () => {
    api.getAgentConfigs.mockResolvedValue({
      data: [configEntry("settings", 3), configEntry("old", 1)],
    });

    const { result, rerender } = renderHook(() =>
      useAgentConfigsVM(agent, true),
    );

    await waitFor(() => {
      rerender();
      expect(result.current.groups[0].items).toHaveLength(2);
    });

    act(() =>
      socket.fire("agent:config", { ...configEntry("old", 2), deleted: true }),
    );
    rerender();
    expect(result.current.groups[0].items.map(item => item.key)).toEqual([
      "settings",
    ]);

    // Ключ из манифеста остаётся строкой без значения.
    act(() =>
      socket.fire("agent:config", {
        ...configEntry("settings", 4),
        deleted: true,
      }),
    );
    rerender();
    expect(result.current.groups[0].items[0].entry).toBeNull();
    expect(api.getAgentConfigs).toHaveBeenCalledTimes(1);
  });
});

describe("useAgentWorkersVM", () => {
  it("действия по строке: занятый или ждущий замены — заменить сейчас", () => {
    const { result } = renderHook(() => useAgentWorkersVM(agent, true));
    const [echo, kv] = result.current.rows;

    expect(echo.metrics).toEqual({ done: 2 });
    expect(result.current.accessOf(echo.worker)).toEqual({
      canRestart: true,
      updateTo: null,
      canReplaceNow: true,
    });
    expect(kv.pending).toBe("restart");
    expect(result.current.accessOf(kv.worker).canReplaceNow).toBe(true);
  });

  it("без права или без связи — без действий; есть новая версия — обновление", () => {
    const fresh = {
      ...agent,
      workers: [{ ...agent.workers[0], updateAvailable: "1.1.0" }],
    };
    const { result: withRight } = renderHook(() =>
      useAgentWorkersVM(fresh, true),
    );

    expect(withRight.current.accessOf(fresh.workers[0]).updateTo).toBe("1.1.0");

    const { result: noRight } = renderHook(() =>
      useAgentWorkersVM(fresh, false),
    );

    expect(noRight.current.accessOf(fresh.workers[0]).canRestart).toBe(false);

    const { result: offline } = renderHook(() =>
      useAgentWorkersVM({ ...fresh, online: false }, true),
    );

    expect(offline.current.accessOf(fresh.workers[0]).updateTo).toBeNull();
  });
});

describe("useAgentLogsVM", () => {
  it("журнал с узла: агент или воркер, записи строками", async () => {
    api.getAgentLogs.mockResolvedValue({
      data: {
        entries: [{ at: 0, level: "warn", source: "echo", msg: "медленно" }],
      },
    });

    const { result, rerender } = renderHook(() => useAgentLogsVM("a-1"));

    act(() => result.current.loadTail());
    await waitFor(() => {
      rerender();
      expect(result.current.tail).toMatch(/WARN {2}\[echo\] медленно/);
    });
    expect(api.getAgentLogs).toHaveBeenLastCalledWith("a-1", { lines: 300 });

    act(() => result.current.setSource("echo"));
    act(() => result.current.loadTail());
    await waitFor(() =>
      expect(api.getAgentLogs).toHaveBeenLastCalledWith("a-1", {
        lines: 300,
        worker: "echo",
      }),
    );
  });
});
