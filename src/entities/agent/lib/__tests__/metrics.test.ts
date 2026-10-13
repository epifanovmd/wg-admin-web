import type { IAgentMetricsPointDto } from "@shared/api/gen/main/model";
import { describe, expect, it } from "vitest";

import {
  hasHostMetric,
  hostMetrics,
  hostPoints,
  mergeMetricsPoints,
  numericFields,
  pointHost,
  readNumber,
  workerMetrics,
} from "../metrics";

const point = (at: number, cpu?: number): IAgentMetricsPointDto => ({
  at,
  host: cpu === undefined ? {} : { cpuPercent: cpu },
});

describe("agent metrics", () => {
  it("склейка: без повторов, по времени, досланные — на своё место", () => {
    const merged = mergeMetricsPoints(
      [point(10), point(30)],
      [point(30), point(20), point(40)],
      0,
    );

    expect(merged.map(p => p.at)).toEqual([10, 20, 30, 40]);
  });

  it("склейка отрезает точки старше окна", () => {
    expect(
      mergeMetricsPoints([point(10)], [point(50)], 20).map(p => p.at),
    ).toEqual([50]);
  });

  it("график только для присланного поля", () => {
    const points = hostPoints([point(1), point(2, 5)]);

    expect(hasHostMetric(points, h => h.cpuPercent)).toBe(true);
    expect(hasHostMetric(hostPoints([point(1)]), h => h.cpuPercent)).toBe(
      false,
    );
  });

  it("метрики узла: значения не того вида пропускаются", () => {
    const host = hostMetrics({
      cpuPercent: 12.5,
      memUsedBytes: "много",
      cpuCores: [10, "x", 20],
      disks: [{ mount: "/", usedBytes: 1, totalBytes: 2 }, { usedBytes: 3 }],
      interfaces: "eth0",
      tcp: { established: 4, listen: "?" },
      temperatures: { maxC: 61, sensors: [{ name: "cpu", c: 61 }, { c: 1 }] },
      gpus: [{ index: 0, name: "GPU", utilPercent: "x" }, { name: "?" }],
    });

    expect(host).toMatchObject({
      cpuPercent: 12.5,
      cpuCores: [10, 20],
      disks: [{ mount: "/", usedBytes: 1, totalBytes: 2 }],
      interfaces: [],
      tcp: { established: 4, listen: undefined },
      temperatureMaxC: 61,
      sensors: [{ name: "cpu", c: 61 }],
      gpus: [{ index: 0, name: "GPU", utilPercent: undefined }],
    });
    expect(host?.memUsedBytes).toBeUndefined();
    expect(hostMetrics("нет")).toBeUndefined();
    expect(pointHost(undefined)).toBeUndefined();
  });

  it("метрики воркера — по имени из точки", () => {
    const withWorkers = { at: 1, workers: { echo: { done: 3 } } };

    expect(workerMetrics(withWorkers, "echo")).toEqual({ done: 3 });
    expect(workerMetrics(withWorkers, "kv")).toBeUndefined();
    expect(workerMetrics(undefined, "echo")).toBeUndefined();
  });

  it("числовые поля, вложенные — через точку; моменты времени — нет", () => {
    const data = {
      at: 1_791_000_000_000,
      hits: 3,
      name: "x",
      db: { size: 10, ok: true, checkedAt: 5 },
    };

    expect(numericFields(data)).toEqual(["db.size", "hits"]);
    expect(readNumber(data, "db.size")).toBe(10);
    expect(readNumber(data, "name")).toBeUndefined();
    expect(numericFields([1, 2])).toEqual([]);
  });
});
