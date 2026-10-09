/**
 * Обновить воркер агента ноды с сервера.
 */
export interface IUpdateWgNodeWorkerBody {
  /** Заменить сразу, не дожидаясь окончания работы воркера. */
  force?: boolean;
}
