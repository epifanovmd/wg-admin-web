import { describe, expect, it, vi } from "vitest";

import { subscribeSocketRoom } from "../rooms";
import { createFakeSocket } from "../testing";

describe("subscribeSocketRoom", () => {
  it("после переподключения — снова вход в комнату и onRejoin; после отписки — нет", () => {
    const socket = createFakeSocket();
    const onRejoin = vi.fn();
    const unsubscribe = subscribeSocketRoom(
      socket,
      "wg-forwards",
      "all",
      onRejoin,
    );

    expect(onRejoin).not.toHaveBeenCalled();

    socket.reconnect();
    expect(
      socket.emitted.filter(e => e.event === "room:subscribe"),
    ).toHaveLength(2);
    expect(onRejoin).toHaveBeenCalledOnce();

    unsubscribe();
    socket.reconnect();
    expect(onRejoin).toHaveBeenCalledOnce();
    expect(socket.emitted.at(-1)?.event).toBe("room:unsubscribe");
    expect(socket.emitted.at(-1)?.args[0]).toEqual({
      type: "wg-forwards",
      id: "all",
    });
  });

  it("нет прав на комнату — не переподписывается и не перечитывает", () => {
    const socket = createFakeSocket();
    const onRejoin = vi.fn();

    socket.emit = (event, ...args) => {
      socket.emitted.push({ event, args });
      const ack = args.at(-1);

      if (typeof ack === "function") ack({ ok: false });
    };
    subscribeSocketRoom(socket, "wg-socks", "all", onRejoin);
    socket.reconnect();

    expect(onRejoin).not.toHaveBeenCalled();
    expect(
      socket.emitted.filter(e => e.event === "room:subscribe"),
    ).toHaveLength(1);
  });
});
