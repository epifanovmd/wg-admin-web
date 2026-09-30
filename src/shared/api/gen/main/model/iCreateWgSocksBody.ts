export interface ICreateWgSocksBody {
  name: string;
  /** @nullable */
  description?: string | null;
  nodeId: string;
  listenPort: number;
  /**
   * Адрес для клиентов, если он не совпадает с нодой (проброс).
   * @nullable
   */
  clientHost?: string | null;
  /** @nullable */
  clientPort?: number | null;
  /** CN/SNI серверного сертификата (по умолчанию publicHost ноды). */
  serverName?: string;
  /**
   * Назначенный владелец; другой пользователь — только с правом назначения.
   * @nullable
   */
  ownerId?: string | null;
}
