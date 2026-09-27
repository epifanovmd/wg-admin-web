import type { JobRunDto } from "@shared/api/gen/main/model";
import { createInjectDecorator, SupportInitialize } from "@shared/lib/di";
import { INotificationService } from "@shared/lib/notifications";
import { ISocketTransport } from "@shared/lib/socket";
import { injectable } from "inversify";

import { jobErrorText } from "../lib/job";
import { IJobStore } from "../model/types";

export const IJobRealtime = createInjectDecorator<IJobRealtime>();

export type IJobRealtime = SupportInitialize;

/** Обновления задач по сокету и тост о завершении или сбое. */
@injectable()
export class JobRealtime implements IJobRealtime {
  constructor(
    @ISocketTransport() private _socket: ISocketTransport,
    @IJobStore() private _jobs: IJobStore,
    @INotificationService() private _notifications: INotificationService,
  ) {}

  initialize() {
    return this._socket.on<[JobRunDto]>("job:updated", job => {
      const before = this._jobs.byId(job.id);

      this._jobs.upsert(job);

      // Тост только на переход в конечное состояние, не на каждый прогресс.
      if (before?.status === job.status) return;

      if (job.status === "completed") {
        this._notifications.success(job.title, { title: "Задача выполнена" });
      } else if (job.status === "failed") {
        this._notifications.error(jobErrorText(job) ?? job.title, {
          title: "Задача не выполнена",
        });
      }
    });
  }
}
