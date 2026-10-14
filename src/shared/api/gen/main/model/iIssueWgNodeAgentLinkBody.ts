export interface IIssueWgNodeAgentLinkBody {
  /** Имя агента; нет — имя ноды. */
  name?: string;
  /** Адрес сервера для агента; без него — `AGENT_PUBLIC_URL` / `APP_PUBLIC_URL`. */
  baseUrl?: string;
  /** Срок одноразового токена, минут (по умолчанию сутки). */
  expiresInMinutes?: number;
  /** Срок ссылки, минут (по умолчанию сутки); токен создаётся при скачивании. */
  linkExpiresInMinutes?: number;
}
