/**
 * Запрос удаления агента с VPS по SSH.
 */
export interface IUninstallWgNodeBody {
  host: string;
  port?: number;
  username?: string;
  privateKey?: string;
  password?: string;
}
