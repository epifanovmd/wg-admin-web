import type { IInstallCommandBodyMode } from "./iInstallCommandBodyMode.ts";

export interface IInstallCommandBody {
  /** Токен регистрации (или `tokenFile` — путь к файлу с ним на узле). */
  token?: string;
  tokenFile?: string;
  name?: string;
  /** Адрес API для узла; без него — `AGENT_PUBLIC_URL`. */
  baseUrl?: string;
  mode?: IInstallCommandBodyMode;
}
