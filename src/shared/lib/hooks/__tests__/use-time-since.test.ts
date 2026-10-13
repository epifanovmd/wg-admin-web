import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTimeSince } from "../use-time-since";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(1_000_000);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useTimeSince", () => {
  it("тикает раз в секунду; без момента — null", () => {
    const { result, rerender } = renderHook(
      ({ at }: { at: number | null }) => useTimeSince(at),
      { initialProps: { at: 990_000 as number | null } },
    );

    expect(result.current).toBe("10 с назад");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe("11 с назад");

    rerender({ at: null });
    expect(result.current).toBeNull();
  });
});
