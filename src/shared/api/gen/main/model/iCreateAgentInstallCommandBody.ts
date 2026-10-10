/**
 * Команда установки агента на ноду: архив папки агента с этого сервера и токен.
 */
export interface ICreateAgentInstallCommandBody {
  /** Токен регистрации; ровно одно из `token` и `tokenFile`. */
  token?: string;
  /** Путь к файлу с токеном на узле. */
  tokenFile?: string;
  /** Адрес сервера; без него — `AGENT_PUBLIC_URL` или `APP_PUBLIC_URL`. */
  baseUrl?: string;
  /** Имя агента (по умолчанию — имя машины). */
  name?: string;
}
