import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

import { useControlledOptions } from "../use-controlled-options";

describe("useControlledOptions", () => {
  it("maps controlled data and preserves loading", () => {
    const getOption = (value: string) => ({
      value,
      label: value.toUpperCase(),
    });
    const { result } = renderHook(() =>
      useControlledOptions({ data: ["one"], getOption, loading: true }),
    );

    expect(result.current).toEqual({
      loading: true,
      options: [{ label: "ONE", value: "one" }],
    });
  });

  it("filters with a custom predicate in search mode", () => {
    const predicate = vi.fn((query: string, option: { value: string }) =>
      option.value.endsWith(query),
    );
    const { result } = renderHook(() =>
      useControlledOptions({
        data: ["one", "two"],
        filterOption: predicate,
        getOption: value => ({ value, label: value }),
        search: true,
      }),
    );

    act(() => result.current.onSearch?.("wo"));
    expect(result.current.searchValue).toBe("wo");
    expect(result.current.options.map(option => option.value)).toEqual(["two"]);
    expect(predicate).toHaveBeenCalled();
  });
});
