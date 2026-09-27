import { describe, expect, it } from "vitest";

import {
  mergeSpeedPoints,
  pushSpeedPoint,
  SPEED_WINDOW_MS,
} from "../live.types";

const point = (ts: number) => ({ ts, rxBps: ts, txBps: 0 });

describe("точки live-графика", () => {
  it("новая точка добавляется, повтор и опоздавшая — нет", () => {
    const points = [point(1), point(2)];

    expect(pushSpeedPoint(points, point(3))).toHaveLength(3);
    expect(pushSpeedPoint(points, point(2))).toBe(points);
    expect(pushSpeedPoint(points, point(1))).toBe(points);
  });

  it("окно — по времени и по числу точек", () => {
    const old = point(0);
    const fresh = point(SPEED_WINDOW_MS + 1);

    expect(pushSpeedPoint([old], fresh)).toEqual([fresh]);
    expect(
      pushSpeedPoint([point(1), point(2)], point(3), 2).map(p => p.ts),
    ).toEqual([2, 3]);
  });

  it("история — основа, из живых точек остаются только более новые", () => {
    expect(
      mergeSpeedPoints(
        [point(1), point(2), point(3)],
        [point(2), point(3), point(4)],
      ).map(p => p.ts),
    ).toEqual([1, 2, 3, 4]);
    expect(mergeSpeedPoints([], [point(5)]).map(p => p.ts)).toEqual([5]);
  });
});
