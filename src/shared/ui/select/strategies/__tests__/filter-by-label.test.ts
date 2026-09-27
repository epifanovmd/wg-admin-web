import { vi } from "vitest";

import type { SelectOption } from "../../types";
import { filterByLabel } from "../filter-by-label";

const options = [
  { value: "one", label: "First option" },
  { value: "two", label: "SECOND option" },
];

describe("filterByLabel", () => {
  it("returns the original list for an empty query", () => {
    expect(filterByLabel(options, "")).toBe(options);
  });

  it("filters labels case-insensitively", () => {
    expect(filterByLabel(options, "second")).toEqual([options[1]]);
  });

  it("uses a custom predicate", () => {
    const predicate = vi.fn((query: string, option: SelectOption<string>) =>
      option.value.startsWith(query),
    );

    expect(filterByLabel(options, "t", predicate)).toEqual([options[1]]);
    expect(predicate).toHaveBeenCalledTimes(2);
  });
});
