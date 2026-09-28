import { connect as ioConnect } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IAppStateService } from "../../../app-state";
import type { INetworkStatusService } from "../../../network";
import type { ITokenProvider } from "../../contract";
import { SocketTransport } from "../socket.transport";

vi.mock("socket.io-client", () => ({ connect: vi.fn() }));

type Handler = (...args: any[]) => void;
type AuthOption = Record<string, unknown> | ((cb: Handler) => void);

/**
 * Фейковый socket.io-клиент. Как настоящий: `active` — клиент сам будет
 * переподключаться; отказ middleware и разрыв сервером его снимают.
 */
const createIoSocket = (auth: AuthOption) => {
  const handlers = new Map<string, Set<Handler>>();
  const fire = (event: string, ...args: unknown[]) =>
    [...(handlers.get(event) ?? [])].forEach(h => h(...args));

  const socket = {
    auth,
    active: false,
    connected: false,
    emitted: [] as Array<{ event: string; args: unknown[] }>,
    connectCalls: 0,
    io: { opts: { query: {} } },
    on: (event: string, h: Handler) => {
      handlers.set(event, (handlers.get(event) ?? new Set()).add(h));

      return socket;
    },
    once: (event: string, h: Handler) => {
      const wrapped = Object.assign(
        (...args: unknown[]) => {
          socket.off(event, h);
          h(...args);
        },
        { fn: h },
      );

      return socket.on(event, wrapped);
    },
    off: (event: string, h: Handler) => {
      handlers.get(event)?.forEach(item => {
        if (item === h || (item as { fn?: Handler }).fn === h) {
          handlers.get(event)!.delete(item);
        }
      });

      return socket;
    },
    removeAllListeners: () => {
      handlers.clear();

      return socket;
    },
    emit: (event: string, ...args: unknown[]) => {
      socket.emitted.push({ event, args });

      return socket;
    },
    connect: () => {
      socket.connectCalls++;
      socket.active = true;

      return socket;
    },
    disconnect: () => {
      socket.active = false;
      socket.connected = false;

      return socket;
    },
    /** Данные handshake, которые клиент отправил бы серверу. */
    handshake: async (): Promise<Record<string, unknown>> => {
      if (typeof socket.auth !== "function") return socket.auth;

      const cb = socket.auth;

      return new Promise(resolve => cb(resolve));
    },
    accept: () => {
      socket.connected = true;
      fire("connect");
    },
    /** Отказ middleware: клиент сам больше не переподключается. */
    reject: (message: string) => {
      socket.active = false;
      fire("connect_error", new Error(message));
    },
    /** Сетевая ошибка: клиент переподключится сам. */
    transportError: () => fire("connect_error", new Error("websocket error")),
    kick: () => {
      socket.active = false;
      socket.connected = false;
      fire("disconnect", "io server disconnect");
    },
    fire,
  };

  return socket;
};

type IoSocket = ReturnType<typeof createIoSocket>;

const connectMock = vi.mocked(ioConnect);

let io: IoSocket;
let wake: (isActive: boolean) => void;
let online: () => void;
let tokenListener: (token: string) => void;
let provider: ITokenProvider & {
  ensureFreshToken: ReturnType<typeof vi.fn>;
  refreshToken: ReturnType<typeof vi.fn>;
};

const createTransport = () => {
  const appState: IAppStateService = {
    isActive: true,
    onChange: cb => {
      wake = cb;

      return () => undefined;
    },
  };
  const network: INetworkStatusService = {
    isOnline: true,
    onOnline: cb => {
      online = cb;

      return () => undefined;
    },
    onOffline: () => () => undefined,
  };

  return new SocketTransport(appState, network, provider);
};

const flush = () => vi.advanceTimersByTimeAsync(0);

beforeEach(() => {
  vi.useFakeTimers();
  connectMock.mockClear();

  let token = "stale";

  provider = {
    get accessToken() {
      return token;
    },
    ensureFreshToken: vi.fn(async () => {
      token = "fresh";
    }),
    refreshToken: vi.fn(async () => {
      token = "refreshed";
    }),
    onTokenChange: cb => {
      tokenListener = cb;

      return () => undefined;
    },
  };

  connectMock.mockImplementation(((
    _url: string,
    opts: { auth: AuthOption },
  ) => {
    io = createIoSocket(opts.auth);

    return io;
  }) as never);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SocketTransport", () => {
  it("handshake берёт токен после ensureFreshToken, а не устаревший", async () => {
    createTransport().initialize();

    await expect(io.handshake()).resolves.toEqual({ token: "fresh" });
    expect(provider.ensureFreshToken).toHaveBeenCalled();
  });

  it("токен не уходит в query URL", () => {
    createTransport().initialize();

    const opts = connectMock.mock.calls[0][1] as { query?: object };

    expect(opts.query ?? {}).toEqual({});
  });

  it("после отказа middleware переподключается тем же сокетом со свежим токеном", async () => {
    createTransport().initialize();
    io.reject("Срок действия токена истёк");

    await vi.advanceTimersByTimeAsync(1000);

    expect(provider.refreshToken).toHaveBeenCalledOnce();
    expect(io.connectCalls).toBe(2);
    expect(connectMock).toHaveBeenCalledOnce();
  });

  it("сетевую ошибку оставляет встроенному переподключению", async () => {
    createTransport().initialize();
    io.transportError();

    await vi.advanceTimersByTimeAsync(30_000);

    expect(io.connectCalls).toBe(1);
  });

  it("после разрыва сервером обновляет токен и переподключается", async () => {
    const transport = createTransport();

    transport.initialize();
    io.accept();
    io.kick();

    expect(transport.state.status).toBe("connecting");

    await vi.advanceTimersByTimeAsync(1000);

    expect(provider.refreshToken).toHaveBeenCalledOnce();
    expect(io.connectCalls).toBe(2);
  });

  it("повторяет с нарастающей задержкой, пока сервер отказывает", async () => {
    createTransport().initialize();
    io.reject("denied");
    await vi.advanceTimersByTimeAsync(1000);
    io.reject("denied");
    await vi.advanceTimersByTimeAsync(1000);

    expect(io.connectCalls).toBe(2);

    await vi.advanceTimersByTimeAsync(1000);

    expect(io.connectCalls).toBe(3);
  });

  it("успешное подключение сбрасывает задержку", async () => {
    createTransport().initialize();
    io.reject("denied");
    await vi.advanceTimersByTimeAsync(1000);
    io.accept();
    io.kick();
    await vi.advanceTimersByTimeAsync(1000);

    expect(io.connectCalls).toBe(3);
  });

  it("возвращение вкладки поднимает неактивный сокет сразу, не пересоздавая", async () => {
    createTransport().initialize();
    io.reject("denied");

    wake(true);
    await flush();

    expect(io.connectCalls).toBe(2);
    expect(connectMock).toHaveBeenCalledOnce();
  });

  it("появление сети поднимает неактивный сокет", async () => {
    createTransport().initialize();
    io.reject("denied");

    online();
    await flush();

    expect(io.connectCalls).toBe(2);
  });

  it("не трогает сокет, который переподключается сам", async () => {
    createTransport().initialize();
    io.transportError();

    wake(true);
    online();
    await flush();

    expect(io.connectCalls).toBe(1);
  });

  it("auth:expired → отправляет свежий токен по живому соединению", async () => {
    createTransport().initialize();
    io.accept();

    io.fire("auth:expired", { graceMs: 30_000 });
    await flush();

    expect(provider.ensureFreshToken).toHaveBeenCalled();
    expect(io.emitted).toContainEqual({
      event: "auth:refresh",
      args: [{ accessToken: "fresh" }],
    });
  });

  it("новый токен сразу уходит серверу, пока соединение живо", () => {
    createTransport().initialize();
    io.accept();

    tokenListener("next");

    expect(io.emitted).toContainEqual({
      event: "auth:refresh",
      args: [{ accessToken: "next" }],
    });
  });

  it("новый токен без соединения не отправляется", () => {
    createTransport().initialize();

    tokenListener("next");

    expect(io.emitted.map(e => e.event)).not.toContain("auth:refresh");
  });

  it("disconnect останавливает повторы", async () => {
    const transport = createTransport();

    transport.initialize();
    io.reject("denied");
    transport.disconnect();

    await vi.advanceTimersByTimeAsync(30_000);
    wake(true);
    await flush();

    expect(io.connectCalls).toBe(1);
    expect(transport.state.status).toBe("disconnected");
  });

  it("connect после disconnect создаёт новый сокет", async () => {
    const transport = createTransport();

    transport.initialize();
    transport.disconnect();

    const connecting = transport.connect();

    io.accept();

    await expect(connecting).resolves.toBeUndefined();
    expect(connectMock).toHaveBeenCalledTimes(2);
  });

  it("очередь emit отправляется после подключения", () => {
    const transport = createTransport();

    transport.initialize();
    transport.emit("hello", 1);

    expect(io.emitted).toEqual([]);

    io.accept();

    expect(io.emitted).toContainEqual({ event: "hello", args: [1] });
  });
});
