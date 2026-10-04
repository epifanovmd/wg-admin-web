import { createInjectDecorator, SupportInitialize } from "@shared/lib/di";

export const IAppDataStore =
  createInjectDecorator<IAppDataStore>("IAppDataStore");

export interface IAppDataStore extends SupportInitialize {
  /**
   * Сессия восстановлена — можно запускать роутер. До этого его beforeLoad
   * ждали бы сеть асинхронно, и редирект на вход попадал в гонку перехода.
   */
  readonly isRestored: boolean;
}
