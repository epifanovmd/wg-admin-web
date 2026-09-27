import { act, renderHook } from "@testing-library/react";

import { useStaticOptions } from "../use-static-options";

const options = [
  { value: "one", label: "First" },
  { value: "two", label: "Second" },
];

describe("useStaticOptions", () => {
  it("returns options without search state when search is disabled", () => {
    const { result } = renderHook(() => useStaticOptions(options));

    expect(result.current).toEqual({ options });
  });

  it("filters searchable options and supports disabling filtering", () => {
    const hook = renderHook(
      ({ filterOption }) =>
        useStaticOptions(options, { filterOption, search: true }),
      { initialProps: { filterOption: true } },
    );

    act(() => hook.result.current.onSearch?.("second"));
    expect(hook.result.current.options).toEqual([options[1]]);

    hook.rerender({ filterOption: false });
    expect(hook.result.current.options).toEqual(options);
  });
});
