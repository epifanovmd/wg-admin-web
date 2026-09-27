import type { ITokenStorage, TokenPair } from "../session.types";

export interface CrossTabTokenStorageOptions {
  /** Ключи хранилища, за которыми следим; правки остальных игнорируем. */
  keys: readonly string[];
  /**
   * Канал `BroadcastChannel` для обмена полной парой: access-токен, срок и
   * сессия уходят в другие вкладки в памяти, на диск пишется только то, что
   * сохраняет внутреннее хранилище. Без канала (или его поддержки) вкладки
   * узнают только о смене сохранённых ключей через событие `storage`.
   */
  channel?: string;
}

/** Сообщение канала: новая пара или `null` — сессия закрыта. */
type TokenMessage = TokenPair | null;

/**
 * Обёртка над постоянным хранилищем, которая синхронизирует вкладки. И
 * `BroadcastChannel`, и событие `storage` доходят только до чужих вкладок,
 * поэтому собственные записи петлю не создают.
 */
export class CrossTabTokenStorage implements ITokenStorage {
  private readonly _channel: BroadcastChannel | undefined;

  constructor(
    private readonly _inner: ITokenStorage,
    private readonly _options: CrossTabTokenStorageOptions,
  ) {
    this._channel =
      _options.channel && typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel(_options.channel)
        : undefined;
  }

  read(): TokenPair | null {
    return this._inner.read();
  }

  write(tokens: TokenPair): void {
    this._inner.write(tokens);
    this._post(tokens);
  }

  clear(): void {
    this._inner.clear();
    this._post(null);
  }

  subscribe(listener: (tokens: TokenPair | null) => void): () => void {
    const channel = this._channel;

    if (channel) {
      const onMessage = (event: MessageEvent<TokenMessage>) =>
        listener(event.data);

      channel.addEventListener("message", onMessage);

      return () => channel.removeEventListener("message", onMessage);
    }

    const onStorage = (event: StorageEvent) => {
      // key === null — хранилище очистили целиком.
      if (event.key !== null && !this._options.keys.includes(event.key)) {
        return;
      }

      listener(this._inner.read());
    };

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }

  /** Закрыть канал; хранилище после этого синхронизацию не ведёт. */
  dispose(): void {
    this._channel?.close();
  }

  private _post(message: TokenMessage): void {
    this._channel?.postMessage(message);
  }
}
