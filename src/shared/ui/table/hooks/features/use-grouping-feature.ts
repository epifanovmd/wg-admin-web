import {
  getExpandedRowModel,
  getGroupedRowModel,
  type GroupingState,
} from "@tanstack/react-table";
import { useMemo } from "react";

import {
  type TableFeatureSpec,
  useTableFeatureState,
} from "./create-table-feature";
import type { TableFeatureOf } from "./types";

export interface GroupingFeatureOptions {
  enabled?: boolean;
  groupingState?: GroupingState;
  defaultGrouping?: GroupingState;
  onGroupingChange?: (state: GroupingState) => void;
}

const SPEC: TableFeatureSpec<"grouping", "grouping"> = {
  kind: "grouping",
  stateKey: "grouping",
  fallback: [],
  changeOption: "onGroupingChange",
};

export const useGroupingFeature = <TData = unknown>(
  options: GroupingFeatureOptions = {},
): TableFeatureOf<TData, "grouping"> => {
  const {
    enabled = true,
    groupingState,
    defaultGrouping,
    onGroupingChange,
  } = options;

  const extraOptions = useMemo(
    () => ({
      enableGrouping: enabled,
      getGroupedRowModel: enabled ? getGroupedRowModel<TData>() : undefined,
      getExpandedRowModel: enabled ? getExpandedRowModel<TData>() : undefined,
    }),
    [enabled],
  );

  return useTableFeatureState<TData, "grouping", "grouping">(
    SPEC,
    {
      enabled,
      value: groupingState,
      defaultValue: defaultGrouping,
      onChange: onGroupingChange,
    },
    extraOptions,
  );
};
