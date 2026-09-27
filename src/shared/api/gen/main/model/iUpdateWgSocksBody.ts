export interface IUpdateWgSocksBody {
  name?: string;
  /** @nullable */
  description?: string | null;
  listenPort?: number;
  /**
   * Адрес для клиентов, если он не совпадает с нодой (проброс).
   * @nullable
   */
  clientHost?: string | null;
  /** @nullable */
  clientPort?: number | null;
  enabled?: boolean;
}
