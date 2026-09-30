import { IUserStore } from "@entities/user";
import { IMainApi } from "@shared/api";
import { createFakeAccess } from "@shared/lib/access/testing";
import { iocContainer } from "@shared/lib/di";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sumStatsSeries, useWgStatsVM } from "../useWgStatsVM";

const api = {
  wgStatsSeries: vi.fn().mockResolvedValue({ data: [] }),
  wgNodeOptions: vi.fn().mockResolvedValue({ data: [{ id: "n1", name: "A" }] }),
  wgInterfaceOptions: vi
    .fn()
    .mockResolvedValue({ data: [{ id: "i1", name: "wg0", nodeName: "A" }] }),
  wgPeerOptions: vi.fn().mockResolvedValue({ data: [{ id: "p1", name: "p" }] }),
};

beforeEach(() => {
  iocContainer.bind(IMainApi.Tid).toConstantValue(api);
  iocContainer
    .bind(IUserStore.Tid)
    .toConstantValue(createFakeAccess({ permissions: ["*"] }));
});

afterEach(() => {
  iocContainer.unbind(IMainApi.Tid);
  iocContainer.unbind(IUserStore.Tid);
});

describe("useWgStatsVM", () => {
  it("загружает опции фильтров нод, интерфейсов и пиров", async () => {
    const { result } = renderHook(() => useWgStatsVM());

    await waitFor(() => {
      expect(api.wgNodeOptions).toHaveBeenCalledOnce();
      expect(api.wgInterfaceOptions).toHaveBeenCalledOnce();
      expect(api.wgPeerOptions).toHaveBeenCalledOnce();
    });
    expect(result.current).toBeTruthy();
  });
});

describe("sumStatsSeries", () => {
  const point = (ts: string, value: number) => ({
    ts,
    rxBps: value,
    txBps: value * 2,
    rxBytes: value * 10,
    txBytes: value * 20,
    rxPeakBps: 0,
    txPeakBps: 0,
  });

  it("складывает группы по bucket'ам и упорядочивает по времени", () => {
    const rows = sumStatsSeries([
      {
        key: "a",
        points: [
          point("2026-09-28T10:01:00.000Z", 1),
          point("2026-09-28T10:00:00.000Z", 2),
        ],
      },
      { key: "b", points: [point("2026-09-28T10:00:00.000Z", 3)] },
    ] as any);

    expect(rows).toEqual([
      {
        ts: Date.parse("2026-09-28T10:00:00.000Z"),
        rxBps: 5,
        txBps: 10,
        rxBytes: 50,
        txBytes: 100,
      },
      {
        ts: Date.parse("2026-09-28T10:01:00.000Z"),
        rxBps: 1,
        txBps: 2,
        rxBytes: 10,
        txBytes: 20,
      },
    ]);
  });
});
