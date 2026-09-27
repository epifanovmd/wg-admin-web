import { IMainApi } from "@shared/api";
import type { JobRunDto } from "@shared/api/gen/main/model";
import { CollectionHolder, MutationHolder } from "@shared/lib/holders";
import { injectable } from "inversify";
import { makeAutoObservable, runInAction } from "mobx";

import { isJobActive, newestJobFirst } from "../lib/job";
import { IJobStore } from "./types";

/** Сколько последних задач показывает список. */
const JOBS_LIMIT = 50;

@injectable()
export class JobStore implements IJobStore {
  private _list = new CollectionHolder<JobRunDto>({
    onFetch: async () => {
      const { data, error } = await this._api.listJobs({ limit: JOBS_LIMIT });

      return { data: data?.items ?? null, error };
    },
    keyExtractor: j => j.id,
  });

  private _cancel = new MutationHolder<void, unknown>();

  constructor(@IMainApi() private _api: IMainApi) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get jobs() {
    return [...this._list.items].sort(newestJobFirst);
  }

  get activeCount() {
    return this._list.items.filter(isJobActive).length;
  }

  get isLoading() {
    return this._list.isLoading;
  }

  get error() {
    return this._list.error;
  }

  byId(id: string) {
    return this._list.get(id);
  }

  async load() {
    if (this._list.isSuccess) {
      await this._list.refresh();
    } else {
      await this._list.load();
    }
  }

  async fetch(id: string) {
    const { data } = await this._api.getJob(id);

    if (data) runInAction(() => this.upsert(data));

    return data ?? null;
  }

  upsert(job: JobRunDto) {
    this._list.upsertItem(job.id, job);
  }

  async cancel(id: string) {
    const res = await this._cancel.run(() => this._api.cancelJob(id));

    if (!res.error) await this.fetch(id);

    return { error: res.error };
  }

  reset() {
    this._list.reset();
  }
}
