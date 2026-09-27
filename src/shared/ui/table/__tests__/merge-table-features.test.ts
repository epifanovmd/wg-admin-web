import { describe, expect, it } from "vitest";

import type { TableFeatureResult } from "../hooks";
import { mergeTableFeatures } from "../hooks";

describe("mergeTableFeatures", () => {
  it("не затирает опции предыдущей фичи значением undefined", () => {
    const filtered = () => () => ({ rows: [], flatRows: [], rowsById: {} });
    const globalFilter: TableFeatureResult<unknown> = {
      kind: "globalFilter",
      state: { globalFilter: "" },
      options: { getFilteredRowModel: filtered, manualFiltering: false },
    };
    const columnFilters: TableFeatureResult<unknown> = {
      kind: "columnFilters",
      state: { columnFilters: [] },
      options: { getFilteredRowModel: undefined, manualFiltering: undefined },
    };

    const merged = mergeTableFeatures([globalFilter, columnFilters]);

    expect(merged.options.getFilteredRowModel).toBe(filtered);
    expect(merged.options.manualFiltering).toBe(false);
    expect(merged.state).toEqual({ globalFilter: "", columnFilters: [] });
  });
});
