import type { ColumnPinningState } from "@tanstack/react-table";
import { useMemo } from "react";

import {
  type TableFeatureSpec,
  useTableFeatureState,
} from "./create-table-feature";
import type { TableFeatureOf } from "./types";

export interface ColumnPinningFeatureOptions {
  enabled?: boolean;
  columnPinningState?: ColumnPinningState;
  defaultColumnPinning?: ColumnPinningState;
  onColumnPinningChange?: (state: ColumnPinningState) => void;
}

const SPEC: TableFeatureSpec<"columnPinning", "columnPinning"> = {
  kind: "columnPinning",
  stateKey: "columnPinning",
  fallback: { left: [], right: [] },
  changeOption: "onColumnPinningChange",
};

export const useColumnPinningFeature = <TData = unknown>(
  options: ColumnPinningFeatureOptions = {},
): TableFeatureOf<TData, "columnPinning"> => {
  const {
    enabled = true,
    columnPinningState,
    defaultColumnPinning,
    onColumnPinningChange,
  } = options;

  const extraOptions = useMemo(
    () => ({ enableColumnPinning: enabled }),
    [enabled],
  );

  return useTableFeatureState<TData, "columnPinning", "columnPinning">(
    SPEC,
    {
      enabled,
      value: columnPinningState,
      defaultValue: defaultColumnPinning,
      onChange: onColumnPinningChange,
    },
    extraOptions,
  );
};
