export interface IWorkerCommandBody {
  /** Тип команды из манифеста воркера. */
  type: string;
  args?: unknown;
  /** Срок ответа воркера, мс; без него — без срока. */
  timeoutMs?: number;
  /** Подождать итог, с (0 — сразу вернуть поставленную команду). */
  waitSeconds?: number;
}
