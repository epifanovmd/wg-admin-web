export interface IWorkerUpdateBody {
  /** Версия из каталога сборок; без неё — старшая для платформы узла. */
  version?: string;
  force?: boolean;
}
