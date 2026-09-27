import type { JobRunDto } from "@shared/api/gen/main/model";
import { createInjectDecorator } from "@shared/lib/di";
import type { IHolderError } from "@shared/lib/holders";

export const IJobStore = createInjectDecorator<IJobStore>();

/** Фоновые задачи текущего пользователя; список — запросом, обновления — по сокету. */
export interface IJobStore {
  readonly jobs: JobRunDto[];
  readonly activeCount: number;
  readonly isLoading: boolean;
  readonly error: IHolderError | null;

  byId(id: string): JobRunDto | undefined;
  load(): Promise<void>;
  /** Подтянуть задачу по id — экран видит её, не дожидаясь события сокета. */
  fetch(id: string): Promise<JobRunDto | null>;
  /** Событие `job:updated`: задача добавляется или обновляется на месте. */
  upsert(job: JobRunDto): void;
  cancel(id: string): Promise<{ error: IHolderError | null }>;
  reset(): void;
}
