import { IMainApi } from "@shared/api";
import type { IAgentMetricsPointDto } from "@shared/api/gen/main/model";
import { iocContainer } from "@shared/lib/di";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeAgent } from "../../lib/__tests__/agent-fixture";
import { AgentsStore } from "../store";
import { IAgentsStore } from "../types";
import { useAgentLiveMetrics } from "../useAgentLiveMetrics";
import { useAgentLog } from "../useAgentLog";
import { useAgentsRealtime } from "../useAgentsRealtime";

const point = (at: number): IAgentMetricsPointDto => ({
  at,
  host: { cpuPercent: 10 },
});

const api = {
  getAgents: vi.fn(),
  getAgentRelease: vi.fn(),
  getAgentMetrics: vi.fn(),
};
let socket: IFakeSocket;
let store: AgentsStore;

beforeEach(() => {
  socket = createFakeSocket();
  store = new AgentsStore(api as unknown as IMainApi);
  api.getAgents.mockResolvedValue({ data: { items: [], total: 0 } });
  api.getAgentRelease.mockResolvedValue({ data: null });
  api.getAgentMetrics.mockResolvedValue({ data: [] });
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer.bind(IAgentsStore.Tid).toConstantValue(store);
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(IAgentsStore.Tid);
  vi.clearAllMocks();
});

const subscribed = () =>
  socket.emitted.filter(e => e.event === "room:subscribe").map(e => e.args[0]);

describe("useAgentsRealtime", () => {
  it("комната agents: изменения и удаление попадают в стор", () => {
    renderHook(() => useAgentsRealtime(true));

    expect(subscribed()).toEqual([{ type: "agents", id: "all" }]);

    act(() => socket.fire("agent:updated", makeAgent()));
    expect(store.byId("a-1")).toBeDefined();

    act(() => socket.fire("agent:deleted", { id: "a-1" }));
    expect(store.byId("a-1")).toBeUndefined();
  });

  it("переподключение перечитывает список", () => {
    renderHook(() => useAgentsRealtime(true));
    act(() => socket.reconnect());

    expect(api.getAgents).toHaveBeenCalled();
  });

  it("без права — не входит в комнату и не слушает", () => {
    renderHook(() => useAgentsRealtime(false));
    act(() => socket.fire("agent:updated", makeAgent()));

    expect(subscribed()).toEqual([]);
    expect(store.byId("a-1")).toBeUndefined();
  });
});

describe("useAgentLiveMetrics", () => {
  it("окно с сервера и точки своего агента из комнаты", async () => {
    const now = Date.now();

    api.getAgentMetrics.mockResolvedValue({ data: [point(now - 2000)] });

    const { result, rerender } = renderHook(() => useAgentLiveMetrics("a-1"));

    // Холдеры — MobX: вне observer хук перечитывается перерисовкой.
    await waitFor(() => {
      rerender();
      expect(result.current.points).toHaveLength(1);
    });
    expect(api.getAgentMetrics).toHaveBeenCalledWith(
      "a-1",
      { since: expect.any(Number), limit: 5000 },
      { queryRace: false },
    );
    expect(api.getAgentMetrics.mock.calls[0][1].since).toBeLessThanOrEqual(
      now - 5 * 60_000 + 1000,
    );
    expect(subscribed()).toEqual([{ type: "agent", id: "a-1" }]);

    act(() =>
      socket.fire("agent:metrics", { agentId: "a-2", point: point(now) }),
    );
    act(() =>
      socket.fire("agent:metrics", { agentId: "a-1", point: point(now) }),
    );
    rerender();

    expect(result.current.points.map(p => p.at)).toEqual([now - 2000, now]);
    expect(result.current.latest?.at).toBe(now);
  });
});

describe("useAgentLog", () => {
  it("уровень уходит серверу, записи фильтруются по уровню и источнику", () => {
    const { result } = renderHook(() => useAgentLog("a-1"));

    expect(
      socket.emitted.find(e => e.event === "agent:log-level")?.args[0],
    ).toEqual({ agentId: "a-1", level: "info" });

    act(() =>
      socket.fire("agent:log", {
        agentId: "a-1",
        entries: [
          { at: 1, level: "debug", source: "agent", msg: "подробно" },
          { at: 2, level: "info", source: "agent", msg: "агент" },
          { at: 3, level: "warn", source: "kv", msg: "воркер" },
        ],
      }),
    );
    expect(result.current.entries.map(e => e.msg)).toEqual(["агент", "воркер"]);
    expect(result.current.sources).toEqual(["agent", "kv"]);

    act(() => result.current.setSource("kv"));
    expect(result.current.entries.map(e => e.msg)).toEqual(["воркер"]);

    act(() => result.current.setLevel("debug"));
    expect(
      socket.emitted.filter(e => e.event === "agent:log-level").at(-1)?.args[0],
    ).toEqual({ agentId: "a-1", level: "debug" });
  });

  it("пока сервер не впустил в комнату, уровень повторяется", () => {
    vi.useFakeTimers();

    const sends: Array<(ack: { ok: boolean }) => void> = [];

    socket.emit = (event: string, ...args: unknown[]) => {
      const ack = args.at(-1);

      if (event === "agent:log-level" && typeof ack === "function") {
        sends.push(ack as (ack: { ok: boolean }) => void);
      }
    };

    renderHook(() => useAgentLog("a-1"));
    act(() => sends[0]({ ok: false }));
    act(() => vi.advanceTimersByTime(1000));
    expect(sends).toHaveLength(2);

    act(() => sends[1]({ ok: true }));
    act(() => vi.advanceTimersByTime(5000));
    expect(sends).toHaveLength(2);
    vi.useRealTimers();
  });
});
