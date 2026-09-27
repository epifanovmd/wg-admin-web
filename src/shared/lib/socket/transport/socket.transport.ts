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

@injectable()
export class SocketTransport implements ISocketTransport {
  private _socket: AppSocket | null = null;
  private _isManualDisconnect = false;
  private _connectingPromise: Promise<void> | null = null;

  private _statusListeners = new Set<SocketStatusListener>();
  private _persistentListeners = new PersistentListeners();
  private _emitQueue = new EmitQueue();

  private _state: SocketTransportState = { status: "idle", error: null };
  private _disposeTokenReaction: (() => void) | null = null;
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

    this._disposeTokenReaction =
      this._tokenProvider?.onTokenChange(token => {
        if (!this._socket || this._isManualDisconnect) return;

        this._socket.auth = { token };
        (this._socket.io.opts.query as Record<string, string>).access_token =
          token;
      }) ?? null;

    const disposeAppActive = this._appState.onChange(isActive => {
      if (isActive && !this._isManualDisconnect && !this._socket?.connected) {
        this.connect().catch(() => {});
      }
    });

    const disposeNetworkOnline = this._network.onOnline(() => {
      if (!this._isManualDisconnect && !this._socket?.connected) {
        this.connect().catch(() => {});
      }
    });

    this.connect().catch(() => {});

    const disposers = () => {
      this._disposeTokenReaction?.();
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
    if (this._connectingPromise) return this._connectingPromise;

    this._connectingPromise = this._doConnect().finally(() => {
      this._connectingPromise = null;
    });

    return this._connectingPromise;
  }

  disconnect(): void {
    this._isManualDisconnect = true;
    this._reconnect.reset();
    this._emitQueue.clear();
    this._persistentListeners.clear();
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
    const removeFromStore = this._persistentListeners.add("connect", handler);

    this._socket?.on("connect", handler);

    return () => {
      removeFromStore();
      this._socket?.off("connect", handler);
    };
  }

  onDisconnect(handler: (reason: string) => void): () => void {
    const removeFromStore = this._persistentListeners.add(
      "disconnect",
      handler,
    );

    this._socket?.on("disconnect", handler as never);

    return () => {
      removeFromStore();
      this._socket?.off("disconnect", handler as never);
    };
  }

  onStatusChange(listener: SocketStatusListener): () => void {
    this._statusListeners.add(listener);

    return () => this._statusListeners.delete(listener);
  }

  private _doConnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this._teardown();

      const accessToken = this._tokenProvider?.accessToken ?? "";

      this._isManualDisconnect = false;
      this._setState({ status: "connecting", error: null });

      const socket: AppSocket = connect(SOCKET_BASE_URL, {
        withCredentials: true,
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 3000,
        reconnectionDelayMax: 30_000,
        transports: ["websocket"],
        timeout: 10_000,
        auth: accessToken ? { token: accessToken } : {},
        query: accessToken ? { access_token: accessToken } : {},
      });

      this._socket = socket;

      this._persistentListeners.bindTo(socket);

      const onFirstConnect = () => {
        socket.off("connect_error", onFirstError);
        resolve();
      };
      const onFirstError = (err: Error) => {
        socket.off("connect", onFirstConnect);
        this._setState({ status: "error", error: err });
        reject(err);
      };

      socket.once("connect", onFirstConnect);
      socket.once("connect_error", onFirstError);

      socket.on("connect", this._onConnect);
      socket.on("connect_error", this._onConnectError);
      socket.on("disconnect", this._onDisconnect);
      socket.on("auth_error", this._onAuthError);

      socket.connect();
    });
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

  private _onConnect = (): void => {
    this._reconnect.reset();
    this._setState({ status: "connected", error: null });
    if (this._socket) {
      this._emitQueue.flush(this._socket);
    }
  };

  private _onDisconnect = (reason: string): void => {
    if (this._isManualDisconnect) return;

    this._setState({ status: "connecting" });

    if (reason === "io server disconnect") {
      this._reconnect.schedule(() =>
        Promise.resolve(this._tokenProvider?.refreshToken())
          .then(() => this.connect())
          .catch(() => {}),
      );
    }
  };

  private _onConnectError = (err: Error): void => {
    console.error("[Socket] Connection error:", err.message);
  };

  private _onAuthError = ({ message }: { message: string }): void => {
    console.warn("[Socket] Auth error:", message);

    if (!this._tokenProvider) return;

    this._reconnect.schedule(() =>
      this._tokenProvider
        ?.restoreSession()
        .then((restored): void => {
          if (restored) this.connect();
        })
        .catch(() => {}),
    );
  };
}
