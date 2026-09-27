/**
 * Поставленная задача установки.
 */
export interface IWgProvisionStartedDto {
  /** id задачи: прогресс — комната `job` по сокету и `GET /api/v1/jobs/{id}`. */
  jobId: string;
}
