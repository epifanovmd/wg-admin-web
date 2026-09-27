import { act, renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { useDependentOptions } from "../use-dependent-options";

const getOption = (value: string) => ({ value, label: value });

describe("useDependentOptions", () => {
  it("loads when the dependency changes and filters the result", async () => {
    const fetch = vi.fn(async (dependency: string) => [
      `${dependency}-one`,
      `${dependency}-two`,
    ]);
    const hook = renderHook(
      ({ dependsOn }) =>
        useDependentOptions({ dependsOn, fetch, getOption, search: true }),
      { initialProps: { dependsOn: "parent" as string | null } },
    );

    expect(hook.result.current.loading).toBe(true);
    await waitFor(() => expect(hook.result.current.loading).toBe(false));
    expect(fetch).toHaveBeenCalledWith("parent", expect.any(AbortSignal));

    act(() => hook.result.current.onSearch?.("two"));
    expect(hook.result.current.options).toEqual([
      { label: "parent-two", value: "parent-two" },
    ]);

    hook.rerender({ dependsOn: null });
    expect(hook.result.current.options).toEqual([]);
  });

  it("shows placeholder options only while loading and exposes the error", async () => {
    let rejectFetch: ((reason?: unknown) => void) | undefined;
    const fetch = vi.fn(
      () =>
        new Promise<string[]>((_, reject) => {
          rejectFetch = reject;
        }),
    );
    const placeholderOptions = [{ value: "placeholder", label: "Placeholder" }];
    const { result } = renderHook(() =>
      useDependentOptions({
        dependsOn: "parent",
        fetch,
        getOption,
        placeholderOptions,
      }),
    );

    // Пока грузится, placeholder-опции показываются вместо спиннера.
    expect(result.current.options).toEqual(placeholderOptions);
    expect(result.current.loading).toBe(false);
    const failure = new Error("failure");

    await act(async () => rejectFetch?.(failure));
    expect(result.current.options).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(failure);
  });
});
