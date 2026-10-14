/**
 * Выдача агента ноды: `.env` (адрес, токен с меткой ноды, имя агента), архив с ним или
 * одноразовая ссылка на архив.
 */
export interface IIssueWgNodeAgentBody {
  /** Имя агента; нет — имя ноды. */
  name?: string;
  /** Адрес сервера для агента; без него — `AGENT_PUBLIC_URL` / `APP_PUBLIC_URL`. */
  baseUrl?: string;
  /** Срок одноразового токена, минут (по умолчанию сутки). */
  expiresInMinutes?: number;
}
