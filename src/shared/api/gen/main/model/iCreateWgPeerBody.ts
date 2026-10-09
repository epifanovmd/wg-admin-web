export interface ICreateWgPeerBody {
  interfaceId: string;
  name: string;
  /** @nullable */
  description?: string | null;
  /**
   * Держатель пира.
   * @nullable
   */
  userId?: string | null;
  /**
   * Импорт существующего клиента: его публичный ключ. Приватный ключ тогда
   * не хранится, конфиг/QR не создаются.
   * @nullable
   */
  publicKey?: string | null;
  /** Создавать ли preshared-ключ (по умолчанию да). */
  withPresharedKey?: boolean;
  /** AllowedIPs клиента (split tunnel); по умолчанию весь трафик. */
  clientAllowedIPs?: string;
  /** @nullable */
  clientDns?: string | null;
  /** @nullable */
  clientMtu?: number | null;
  persistentKeepalive?: number;
  /** @nullable */
  expiresAt?: string | null;
  enabled?: boolean;
}
