export interface ICreateWgNodeBody {
  name: string;
  /** @nullable */
  description?: string | null;
  /**
   * Публичный хост (IP/домен) — endpoint клиентов по умолчанию.
   * @nullable
   */
  publicHost?: string | null;
  /**
   * Назначенный владелец; другой пользователь — только с правом назначения.
   * @nullable
   */
  ownerId?: string | null;
}
