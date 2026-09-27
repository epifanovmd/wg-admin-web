import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { useEagerOptions } from "../use-eager-options";

describe("useEagerOptions", () => {
  it("loads eagerly, maps and filters options", async () => {
    const fetch = vi.fn(async () => ["First", "Second"]);
    const { result } = renderHook(() =>
      useEagerOptions({
        fetch,
        getOption: value => ({ value: value.toLowerCase(), label: value }),
        search: true,
      }),
    );

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.options).toHaveLength(2);

    act(() => result.current.onSearch?.("second"));
    expect(result.current.options).toEqual([
      { label: "Second", value: "second" },
    ]);
  });

  it("aborts the previous request when fetchKey changes", () => {
    const signals: AbortSignal[] = [];
    const fetch = vi.fn((signal: AbortSignal) => {
      signals.push(signal);

      return new Promise<string[]>(() => undefined);
    });
    const hook = renderHook(
      ({ fetchKey }) =>
        useEagerOptions({
          fetch,
          fetchKey,
          getOption: value => ({ value, label: value }),
        }),
      { initialProps: { fetchKey: 1 } },
    );

    hook.rerender({ fetchKey: 2 });
    expect(signals[0].aborted).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
