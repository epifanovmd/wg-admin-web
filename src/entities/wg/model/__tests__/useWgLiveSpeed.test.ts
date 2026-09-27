import { iocContainer } from "@shared/lib/di";
import { ISocketTransport } from "@shared/lib/socket";
import { createFakeSocket, type IFakeSocket } from "@shared/lib/socket/testing";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useWgLiveSpeed } from "../useWgLiveSpeed";

interface Live {
  nodeId: string;
  ts: string;
  rxBps: number;
  txBps: number;
}

const snapshot = (nodeId: string, rxBps: number): Live => ({
  nodeId,
  ts: new Date(1000 * rxBps).toISOString(),
  rxBps,
  txBps: 0,
});

let socket: IFakeSocket;

beforeEach(() => {
  socket = createFakeSocket();
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
});

afterEach(() => iocContainer.unbind(ISocketTransport.Tid));

const render = (id: string | null) =>
  renderHook(
    ({ id: current }: { id: string | null }) =>
      useWgLiveSpeed<Live>({
        id: current,
        event: "wg:node:stats",
        match: (live, nodeId) => live.nodeId === nodeId,
        load: nodeId =>
          Promise.resolve({ data: nodeId === "a" ? snapshot("a", 1) : null }),
      }),
    { initialProps: { id } },
  );

describe("useWgLiveSpeed", () => {
  it("снимок при открытии, события своего id — в график", async () => {
    const { result } = render("a");

    await waitFor(() => expect(result.current.live?.rxBps).toBe(1));

    act(() => {
      socket.fire("wg:node:stats", snapshot("b", 7));
      socket.fire("wg:node:stats", snapshot("a", 2));
    });

    expect(result.current.live?.rxBps).toBe(2);
    expect(result.current.points.map(point => point.rxBps)).toEqual([2]);
  });

  it("при смене id прежние данные не показываются", async () => {
    const hook = render("a");

    await waitFor(() => expect(hook.result.current.live).not.toBeNull());
    act(() => socket.fire("wg:node:stats", snapshot("a", 3)));

    hook.rerender({ id: "b" });

    expect(hook.result.current.live).toBeNull();
    expect(hook.result.current.points).toEqual([]);
  });

  it("без id не грузит и не слушает", () => {
    const { result } = render(null);

    act(() => socket.fire("wg:node:stats", snapshot("a", 1)));

    expect(result.current.live).toBeNull();
  });

  it("история последних минут — сразу в графике, сокет продолжает её", async () => {
    const { result } = renderHook(() =>
      useWgLiveSpeed<Live>({
        id: "a",
        event: "wg:node:stats",
        match: (live, nodeId) => live.nodeId === nodeId,
        load: () => Promise.resolve({ data: snapshot("a", 3) }),
        loadWindow: () =>
          Promise.resolve({
            data: [1, 2, 3].map(rxBps => ({
              ts: 1000 * rxBps,
              rxBps,
              txBps: 0,
            })),
          }),
      }),
    );

    await waitFor(() => expect(result.current.points).toHaveLength(3));

    act(() => {
      // Повтор последней точки истории не дублируется.
      socket.fire("wg:node:stats", snapshot("a", 3));
      socket.fire("wg:node:stats", snapshot("a", 4));
    });

    expect(result.current.points.map(point => point.rxBps)).toEqual([
      1, 2, 3, 4,
    ]);
  });
});
