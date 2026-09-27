import {
  type FilterFnOption,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useMemo } from "react";

import {
  type TableFeatureSpec,
  useTableFeatureState,
} from "./create-table-feature";
import type { TableFeatureOf } from "./types";

export interface GlobalFilterFeatureOptions<TData = unknown> {
  enabled?: boolean;
  globalFilterState?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (state: string) => void;
  globalFilterFn?: FilterFnOption<TData>;
  manualFiltering?: boolean;
}

const SPEC: TableFeatureSpec<"globalFilter", "globalFilter"> = {
  kind: "globalFilter",
  stateKey: "globalFilter",
  fallback: "",
  changeOption: "onGlobalFilterChange",
};

export const useGlobalFilterFeature = <TData = unknown>(
  options: GlobalFilterFeatureOptions<TData> = {},
): TableFeatureOf<TData, "globalFilter"> => {
  const {
    enabled = true,
    globalFilterState,
    defaultGlobalFilter,
    onGlobalFilterChange,
    globalFilterFn,
    manualFiltering,
  } = options;

  const extraOptions = useMemo(
    () => ({
      enableGlobalFilter: enabled,
      globalFilterFn,
      manualFiltering,
      getFilteredRowModel:
        enabled && !manualFiltering ? getFilteredRowModel<TData>() : undefined,
    }),
    [enabled, globalFilterFn, manualFiltering],
  );

  return useTableFeatureState<TData, "globalFilter", "globalFilter">(
    SPEC,
    {
      enabled,
      value: globalFilterState,
      defaultValue: defaultGlobalFilter,
      onChange: onGlobalFilterChange,
    },
    extraOptions,
  );
};
