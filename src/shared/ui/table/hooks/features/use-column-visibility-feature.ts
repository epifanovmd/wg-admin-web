import type { VisibilityState } from "@tanstack/react-table";

import {
  type TableFeatureSpec,
  useTableFeatureState,
} from "./create-table-feature";
import type { TableFeatureOf } from "./types";

export interface ColumnVisibilityFeatureOptions {
  enabled?: boolean;
  columnVisibilityState?: VisibilityState;
  defaultColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (state: VisibilityState) => void;
}

const SPEC: TableFeatureSpec<"columnVisibility", "columnVisibility"> = {
  kind: "columnVisibility",
  stateKey: "columnVisibility",
  fallback: {},
  changeOption: "onColumnVisibilityChange",
};

export const useColumnVisibilityFeature = <TData = unknown>(
  options: ColumnVisibilityFeatureOptions = {},
): TableFeatureOf<TData, "columnVisibility"> =>
  useTableFeatureState<TData, "columnVisibility", "columnVisibility">(SPEC, {
    enabled: options.enabled,
    value: options.columnVisibilityState,
    defaultValue: options.defaultColumnVisibility,
    onChange: options.onColumnVisibilityChange,
  });
