import { act, renderHook } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { useInfiniteOptions } from "../use-infinite-options";

describe("useInfiniteOptions", () => {
  afterEach(() => vi.useRealTimers());

  it("loads the first page, appends more and stops after a short page", async () => {
    vi.useFakeTimers();
    const fetchPage = vi.fn(async (_query: string, page: number) =>
      page === 0 ? ["one", "two"] : ["three"],
    );
    const { result } = renderHook(() =>
      useInfiniteOptions({
        fetchPage,
        getOption: value => ({ value, label: value }),
        pageSize: 2,
      }),
    );

    act(() => result.current.onOpenChange?.(true));
    await act(async () => vi.runAllTimersAsync());
    expect(result.current.options.map(option => option.value)).toEqual([
      "one",
      "two",
    ]);

    await act(async () => result.current.onScrollEnd?.());
    expect(fetchPage).toHaveBeenLastCalledWith("", 1, expect.any(AbortSignal));
    expect(result.current.options.map(option => option.value)).toEqual([
      "one",
      "two",
      "three",
    ]);

    await act(async () => result.current.onScrollEnd?.());
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("waits for the minimum query length and debounces search", async () => {
    vi.useFakeTimers();
    const fetchPage = vi.fn(async () => ["result"]);
    const { result } = renderHook(() =>
      useInfiniteOptions({
        debounce: 50,
        fetchPage,
        getOption: value => ({ value, label: value }),
        minQueryLength: 2,
      }),
    );

    act(() => result.current.onOpenChange?.(true));
    act(() => result.current.onSearch?.("a"));
    await act(async () => vi.runAllTimersAsync());
    expect(fetchPage).not.toHaveBeenCalled();

    act(() => result.current.onSearch?.("ab"));
    await act(async () => vi.advanceTimersByTimeAsync(50));
    expect(fetchPage).toHaveBeenCalledWith("ab", 0, expect.any(AbortSignal));
  });
});
