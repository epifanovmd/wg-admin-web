import type { IMainApi } from "@shared/api";
import type { JobRunDto } from "@shared/api/gen/main/model";
import { describe, expect, it, vi } from "vitest";

import { JobStore } from "../store";

const job = (id: string, patch: Partial<JobRunDto> = {}): JobRunDto => ({
  id,
  queue: "demo.echo",
  status: "queued",
  title: `job ${id}`,
  progress: 0,
  progressText: null,
  logTail: [],
  result: null,
  error: null,
  ownerId: "u-1",
  scopeType: null,
  scopeId: null,
  attempt: 1,
  cancelRequested: false,
  startedAt: null,
  finishedAt: null,
  createdAt: "2026-09-26T10:00:00.000Z",
  ...patch,
});

const createStore = (api: Partial<IMainApi>) =>
  new JobStore(api as unknown as IMainApi);

describe("JobStore", () => {
  it("список — новые первыми, активные считаются", async () => {
    const store = createStore({
      listJobs: vi.fn().mockResolvedValue({
        data: {
          items: [
            job("old", { status: "completed" }),
            job("new", { createdAt: "2026-09-26T11:00:00.000Z" }),
          ],
          total: 2,
          offset: 0,
          limit: 50,
        },
      }),
    } as Partial<IMainApi>);

    await store.load();

    expect(store.jobs.map(j => j.id)).toEqual(["new", "old"]);
    expect(store.activeCount).toBe(1);
  });

  it("событие сокета обновляет задачу на месте и добавляет новую", () => {
    const store = createStore({});

    store.upsert(job("j-1"));
    store.upsert(job("j-1", { status: "running", progress: 0.5 }));
    store.upsert(job("j-2"));

    expect(store.byId("j-1")?.progress).toBe(0.5);
    expect(store.jobs).toHaveLength(2);
  });

  it("после отмены подтягивает свежее состояние задачи", async () => {
    const getJob = vi
      .fn()
      .mockResolvedValue({ data: job("j-1", { cancelRequested: true }) });
    const store = createStore({
      cancelJob: vi.fn().mockResolvedValue({ data: null, error: null }),
      getJob,
    } as Partial<IMainApi>);

    const res = await store.cancel("j-1");

    expect(res.error).toBeNull();
    expect(getJob).toHaveBeenCalledWith("j-1");
    expect(store.byId("j-1")?.cancelRequested).toBe(true);
  });
});
