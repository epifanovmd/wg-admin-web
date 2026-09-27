import { getSortedRowModel, type SortingState } from "@tanstack/react-table";
import { useMemo } from "react";

import {
  type TableFeatureSpec,
  useTableFeatureState,
} from "./create-table-feature";
import type { TableFeatureOf } from "./types";

export interface SortingFeatureOptions {
  enabled?: boolean;
  sortingState?: SortingState;
  defaultSorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;
  manualSorting?: boolean;
  enableMultiSort?: boolean;
  enableSortingRemoval?: boolean;
  sortDescFirst?: boolean;
}

const SPEC: TableFeatureSpec<"sorting", "sorting"> = {
  kind: "sorting",
  stateKey: "sorting",
  fallback: [],
  changeOption: "onSortingChange",
};

export const useSortingFeature = <TData = unknown>(
  options: SortingFeatureOptions = {},
): TableFeatureOf<TData, "sorting"> => {
  const {
    enabled = true,
    sortingState,
    defaultSorting,
    onSortingChange,
    manualSorting,
    enableMultiSort,
    enableSortingRemoval,
    sortDescFirst,
  } = options;

  const extraOptions = useMemo(
    () => ({
      enableSorting: enabled,
      manualSorting,
      enableMultiSort,
      enableSortingRemoval,
      sortDescFirst,
      getSortedRowModel:
        enabled && !manualSorting ? getSortedRowModel<TData>() : undefined,
    }),
    [
      enabled,
      manualSorting,
      enableMultiSort,
      enableSortingRemoval,
      sortDescFirst,
    ],
  );

  return useTableFeatureState<TData, "sorting", "sorting">(
    SPEC,
    {
      enabled,
      value: sortingState,
      defaultValue: defaultSorting,
      onChange: onSortingChange,
    },
    extraOptions,
  );
};
