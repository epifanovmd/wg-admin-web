import { afterEach, describe, expect, it, vi } from "vitest";

import { clearDevPerformanceEntries } from "../dev-performance";

describe("clearDevPerformanceEntries", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("в режиме разработки периодически очищает записи measure", () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(performance, "clearMeasures");
    const stop = clearDevPerformanceEntries(true);

    vi.advanceTimersByTime(25_000);
    expect(clear).toHaveBeenCalledTimes(2);

    stop?.();
    vi.advanceTimersByTime(30_000);
    expect(clear).toHaveBeenCalledTimes(2);
  });

  it("вне режима разработки ничего не делает", () => {
    expect(clearDevPerformanceEntries(false)).toBeUndefined();
  });
});
