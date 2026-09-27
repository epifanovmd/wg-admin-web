import { iocContainer } from "@shared/lib/di";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useSocketEvent, useSocketRoom } from "../hooks";
import { createFakeSocket, type IFakeSocket } from "../testing";
import { ISocketTransport } from "../transport";

let socket: IFakeSocket;

beforeEach(() => {
  socket = createFakeSocket();
  iocContainer.bind(ISocketTransport.Tid).toConstantValue(socket);
});

afterEach(() => {
  iocContainer.unbind(ISocketTransport.Tid);
});

const rooms = (event: string) =>
  socket.emitted.filter(item => item.event === event).map(item => item.args[0]);

describe("useSocketEvent", () => {
  it("вызывает свежий обработчик и отписывается при размонтировании", () => {
    const first = vi.fn();
    const second = vi.fn();
    const hook = renderHook(
      ({ handler }) => useSocketEvent<[number]>("tick", handler),
      { initialProps: { handler: first } },
    );

    hook.rerender({ handler: second });
    socket.fire("tick", 1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(1);

    hook.unmount();
    socket.fire("tick", 2);
    expect(second).toHaveBeenCalledOnce();
  });

  it("не подписывается при enabled: false", () => {
    const handler = vi.fn();

    renderHook(() => useSocketEvent("tick", handler, false));
    socket.fire("tick");

    expect(handler).not.toHaveBeenCalled();
  });
});

describe("useSocketRoom", () => {
  it("входит в комнату, при смене id переходит в новую, без id не входит", () => {
    const onRejoin = vi.fn();
    const hook = renderHook(
      ({ id }: { id: string | null }) => useSocketRoom("wg-node", id, onRejoin),
      { initialProps: { id: "a" as string | null } },
    );

    hook.rerender({ id: "b" });
    expect(rooms("room:subscribe")).toEqual([
      { type: "wg-node", id: "a" },
      { type: "wg-node", id: "b" },
    ]);
    expect(rooms("room:unsubscribe")).toEqual([{ type: "wg-node", id: "a" }]);

    socket.reconnect();
    expect(onRejoin).toHaveBeenCalledOnce();

    hook.rerender({ id: null });
    expect(rooms("room:unsubscribe")).toHaveLength(2);
    expect(rooms("room:subscribe")).toHaveLength(3);
  });
});
