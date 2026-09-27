import { EJobRunStatus, type JobRunDto } from "@shared/api/gen/main/model";

const ACTIVE = new Set<EJobRunStatus>([
  EJobRunStatus.queued,
  EJobRunStatus.running,
]);

/** Задача ещё идёт: её можно отменить, прогресс меняется. */
export const isJobActive = (job: JobRunDto): boolean => ACTIVE.has(job.status);

/** Текст ошибки для человека; `null` — ошибки нет. */
export const jobErrorText = (job: JobRunDto): string | null =>
  job.error?.message ?? null;

/** Новые задачи — первыми. */
export const newestJobFirst = (a: JobRunDto, b: JobRunDto): number =>
  b.createdAt.localeCompare(a.createdAt);
