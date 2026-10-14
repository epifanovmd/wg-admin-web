import type { RecordStringString } from "./recordStringString.ts";

export interface IIssueAgentBody {
  /** Имя агента (`AGENT_NAME` в `.env`); нет — имя машины. */
  name?: string;
  /** Метки зарегистрированного агента (агент их не перепишет). */
  labels?: RecordStringString;
  /** Сколько машин может зарегистрироваться этим токеном (по умолчанию 1). */
  maxUses?: number;
  /** Срок токена, мин (по умолчанию сутки). */
  expiresInMinutes?: number;
  /** Адрес API для агента; без него — `AGENT_PUBLIC_URL`. */
  baseUrl?: string;
}
