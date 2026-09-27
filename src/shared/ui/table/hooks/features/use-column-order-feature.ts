import type { ColumnOrderState } from "@tanstack/react-table";

import {
  type TableFeatureSpec,
  useTableFeatureState,
} from "./create-table-feature";
import type { TableFeatureOf } from "./types";

export interface ColumnOrderFeatureOptions {
  enabled?: boolean;
  columnOrderState?: ColumnOrderState;
  defaultColumnOrder?: ColumnOrderState;
  onColumnOrderChange?: (state: ColumnOrderState) => void;
}

const SPEC: TableFeatureSpec<"columnOrder", "columnOrder"> = {
  kind: "columnOrder",
  stateKey: "columnOrder",
  fallback: [],
  changeOption: "onColumnOrderChange",
};

export const useColumnOrderFeature = <TData = unknown>(
  options: ColumnOrderFeatureOptions = {},
): TableFeatureOf<TData, "columnOrder"> =>
  useTableFeatureState<TData, "columnOrder", "columnOrder">(SPEC, {
    enabled: options.enabled,
    value: options.columnOrderState,
    defaultValue: options.defaultColumnOrder,
    onChange: options.onColumnOrderChange,
  });
