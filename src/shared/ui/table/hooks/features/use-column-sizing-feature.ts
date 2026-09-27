import type {
  ColumnResizeDirection,
  ColumnResizeMode,
  ColumnSizingState,
} from "@tanstack/react-table";
import { useMemo } from "react";

import {
  type TableFeatureSpec,
  useTableFeatureState,
} from "./create-table-feature";
import type { TableFeatureOf } from "./types";

export interface ColumnSizingFeatureOptions {
  enabled?: boolean;
  columnSizingState?: ColumnSizingState;
  defaultColumnSizing?: ColumnSizingState;
  onColumnSizingChange?: (state: ColumnSizingState) => void;
  columnResizeMode?: ColumnResizeMode;
  columnResizeDirection?: ColumnResizeDirection;
}

const SPEC: TableFeatureSpec<"columnSizing", "columnSizing"> = {
  kind: "columnSizing",
  stateKey: "columnSizing",
  fallback: {},
  changeOption: "onColumnSizingChange",
};

export const useColumnSizingFeature = <TData = unknown>(
  options: ColumnSizingFeatureOptions = {},
): TableFeatureOf<TData, "columnSizing"> => {
  const {
    enabled = true,
    columnSizingState,
    defaultColumnSizing,
    onColumnSizingChange,
    columnResizeMode = "onChange",
    columnResizeDirection,
  } = options;

  const extraOptions = useMemo(
    () => ({
      enableColumnResizing: enabled,
      columnResizeMode,
      columnResizeDirection,
    }),
    [enabled, columnResizeMode, columnResizeDirection],
  );

  return useTableFeatureState<TData, "columnSizing", "columnSizing">(
    SPEC,
    {
      enabled,
      value: columnSizingState,
      defaultValue: defaultColumnSizing,
      onChange: onColumnSizingChange,
    },
    extraOptions,
  );
};
