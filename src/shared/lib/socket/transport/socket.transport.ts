import { SOCKET_BASE_URL } from "@shared/config/env";
import { injectable } from "inversify";
import { connect } from "socket.io-client";

import { IAppStateService } from "../../app-state";
import { INetworkStatusService } from "../../network";
import { ITokenProvider } from "../contract";
import { EmitQueue, PersistentListeners } from "./helpers";
import { ReconnectScheduler } from "./reconnect-scheduler";
import {
  AppSocket,
  ISocketTransport,
  SocketStatusListener,
  SocketTransportState,
} from "./socket.transport.types";

const noop = () => {};

interface IPendingConnect {
  promise: Promise<void>;
  reject: (err: Error) => void;
}

/**
 * Одно долгоживущее соединение socket.io.
 *
 * - Токен запрашивается перед каждым handshake (`auth`-колбэк), поэтому
 *   встроенные повторы не уходят со старым токеном после сна вкладки.
 * - Сетевые обрывы переподключает сам socket.io. Когда он сдаётся — сервер
 *   отказал в подключении или разорвал его (`socket.active === false`), —
 *   транспорт обновляет токен и повторяет с backoff.
 * - Новый токен уходит по живому соединению (`auth:refresh`), в том числе
 *   в ответ на `auth:expired`, — сервер не рвёт соединение по сроку.
 * - Возвращение вкладки и появление сети поднимают сдавшийся сокет сразу.
 */
@injectable()
export class SocketTransport implements ISocketTransport {
  private _socket: AppSocket | null = null;
  private _isManualDisconnect = false;
  private _pending: IPendingConnect | null = null;

  private _statusListeners = new Set<SocketStatusListener>();
  private _persistentListeners = new PersistentListeners();
  private _emitQueue = new EmitQueue();

  private _state: SocketTransportState = { status: "idle", error: null };
  private _initializeDisposers: (() => void) | null = null;
  private _reconnect = new ReconnectScheduler();

  /**
   * Провайдер токена необязателен: без него соединение гостевое — сервер
   * такие принимает. Появится авторизация — достаточно забиндить контракт.
   */
  constructor(
    @IAppStateService() private _appState: IAppStateService,
    @INetworkStatusService() private _network: INetworkStatusService,
    @ITokenProvider({ optional: true })
    private _tokenProvider?: ITokenProvider,
  ) {}

  get state(): SocketTransportState {
    return this._state;
  }

  initialize(): () => void {
    if (this._initializeDisposers) return this._initializeDisposers;

    const disposeToken =
      this._tokenProvider?.onTokenChange(this._sendToken) ?? noop;
    const disposeAppActive = this._appState.onChange(isActive => {
      if (isActive) this._onWake();
    });
    const disposeNetworkOnline = this._network.onOnline(this._onWake);

    this.connect().catch(noop);

    const disposers = () => {
      disposeToken();
      disposeAppActive();
      disposeNetworkOnline();
      this.disconnect();
      this._initializeDisposers = null;
    };

    this._initializeDisposers = disposers;

    return disposers;
  }

  connect(): Promise<void> {
    if (this._socket?.connected) return Promise.resolve();
    if (this._pending) return this._pending.promise;

    this._isManualDisconnect = false;

    const socket = this._socket ?? this._createSocket();
    const pending = {} as IPendingConnect;

    pending.promise = new Promise<void>((resolve, reject) => {
      const settle = () => {
        socket.off("connect", onConnect);
        socket.off("connect_error", onError);
        if (this._pending === pending) this._pending = null;
      };
      const onConnect = () => {
        settle();
        resolve();
      };
      const onError = (err: Error) => {
        settle();
        reject(err);
      };

      pending.reject = onError;
      socket.once("connect", onConnect);
      socket.once("connect_error", onError);
    });

    this._pending = pending;

    if (!socket.active) {
      this._setState({ status: "connecting", error: null });
      socket.connect();
    }

    return pending.promise;
  }

  disconnect(): void {
    this._isManualDisconnect = true;
    this._reconnect.reset();
    this._emitQueue.clear();
    this._persistentListeners.clear();
    this._pending?.reject(new Error("Socket disconnected"));
    this._teardown();
    this._setState({ status: "disconnected", error: null });
  }

  on<TArgs extends any[]>(
    event: string,
    handler: (...args: TArgs) => void,
  ): () => void {
    const removeFromStore = this._persistentListeners.add(event, handler);

    this._socket?.on(event, handler);

    return () => {
      removeFromStore();
      this._socket?.off(event, handler);
    };
  }

  emit<TArgs extends any[]>(event: string, ...args: TArgs): void {
    const doEmit = (socket: AppSocket) => socket.emit(event, ...args);

    if (this._socket?.connected) {
      doEmit(this._socket);
    } else {
      this._emitQueue.enqueue(socket => doEmit(socket));
    }
  }

  onConnect(handler: () => void): () => void {
    return this.on("connect", handler);
  }

  onDisconnect(handler: (reason: string) => void): () => void {
    return this.on("disconnect", handler);
  }

  onStatusChange(listener: SocketStatusListener): () => void {
    this._statusListeners.add(listener);

    return () => this._statusListeners.delete(listener);
  }

  private _createSocket(): AppSocket {
    const socket: AppSocket = connect(SOCKET_BASE_URL, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10_000,
      transports: ["websocket"],
      timeout: 10_000,
      auth: this._provideAuth,
    });

    this._socket = socket;
    this._persistentListeners.bindTo(socket);

    socket.on("connect", this._onConnect);
    socket.on("connect_error", this._onConnectError);
    socket.on("disconnect", this._onDisconnect);
    socket.on("auth:expired", this._onAuthExpired);

    return socket;
  }

  private _teardown(): void {
    if (this._socket) {
      this._socket.removeAllListeners();
      this._socket.disconnect();
      this._socket = null;
    }
  }

  private _setState(partial: Partial<SocketTransportState>): void {
    this._state = { ...this._state, ...partial };
    this._statusListeners.forEach(l => l(this._state));
  }

  /** Данные handshake: socket.io вызывает перед каждой попыткой подключения. */
  private _provideAuth = (cb: (data: object) => void): void => {
    const provider = this._tokenProvider;

    if (!provider) {
      cb({});

      return;
    }

    provider
      .ensureFreshToken()
      .catch(noop)
      .then(() => {
        const token = provider.accessToken;

        cb(token ? { token } : {});
      });
  };

  /** Отдать серверу токен по живому соединению, чтобы тот продлил его срок. */
  private _sendToken = (token: string): void => {
    if (token && this._socket?.connected) {
      this._socket.emit("auth:refresh", { accessToken: token });
    }
  };

  /** Сокет, от которого socket.io отказался; живой или повторяющий не в счёт. */
  private _isAbandoned(): boolean {
    if (this._isManualDisconnect || !this._socket) return false;

    return !this._socket.connected && !this._socket.active;
  }

  /** Вкладку вернули или сеть появилась: поднять сокет сразу, без ожидания backoff. */
  private _onWake = (): void => {
    if (!this._isAbandoned()) return;

    this._reconnect.reset();
    this.connect().catch(noop);
  };

  /** socket.io сдался: обновить токен и повторить с backoff. */
  private _scheduleReconnect(): void {
    this._reconnect.schedule(() => {
      Promise.resolve(this._tokenProvider?.refreshToken())
        .catch(noop)
        .then(() => {
          if (this._isAbandoned()) this.connect().catch(noop);
        });
    });
  }

  private _onConnect = (): void => {
    this._reconnect.reset();
    this._setState({ status: "connected", error: null });
    if (this._socket) {
      this._emitQueue.flush(this._socket);
    }
  };

  private _onDisconnect = (): void => {
    if (this._isManualDisconnect) return;

    this._setState({ status: "connecting" });

    if (!this._socket?.active) this._scheduleReconnect();
  };

  private _onConnectError = (err: Error): void => {
    if (this._isManualDisconnect) return;

    this._setState({ status: "error", error: err });

    if (!this._socket?.active) this._scheduleReconnect();
  };

  private _onAuthExpired = (): void => {
    const provider = this._tokenProvider;

    if (!provider) return;

    provider
      .ensureFreshToken()
      .catch(noop)
      .then(() => this._sendToken(provider.accessToken));
  };
}
