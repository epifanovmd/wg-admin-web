/**
 * Обновить воркер агента ноды из выпуска.
 */
export interface IUpdateWgNodeWorkerBody {
  /** Заменить сразу, не дожидаясь окончания работы воркера. */
  force?: boolean;
}
