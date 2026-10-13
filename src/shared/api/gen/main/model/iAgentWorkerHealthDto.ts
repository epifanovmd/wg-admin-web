/**
 * Пульс воркера.
 */
export interface IAgentWorkerHealthDto {
  ok: boolean;
  /** Идёт работа, которую нельзя прерывать: плановая замена ждёт её окончания. */
  busy?: boolean;
  message?: string;
}
