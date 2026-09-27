import { useControllableState } from "@shared/lib/hooks";
import type { Row, RowSelectionState } from "@tanstack/react-table";
import { useMemo } from "react";

import type { RowSelectionMode, TableFeatureOf } from "./types";

export interface RowSelectionFeatureOptions<TData> {
  enabled?: boolean;
  mode?: RowSelectionMode;
  rowSelectionState?: RowSelectionState;
  defaultRowSelection?: RowSelectionState;
  onRowSelectionChange?: (state: RowSelectionState) => void;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  enableSubRowSelection?: boolean | ((row: Row<TData>) => boolean);
}

const DEFAULT_SELECTION: RowSelectionState = {};

export const useRowSelectionFeature = <TData = unknown>(
  options: RowSelectionFeatureOptions<TData> = {},
): TableFeatureOf<TData, "rowSelection"> => {
  const {
    enabled = true,
    mode = "multi",
    rowSelectionState,
    defaultRowSelection,
    onRowSelectionChange,
    enableRowSelection = true,
    enableSubRowSelection,
  } = options;

  const [state, setState] = useControllableState<RowSelectionState>({
    value: rowSelectionState,
    defaultValue: defaultRowSelection ?? DEFAULT_SELECTION,
    onChange: onRowSelectionChange,
  });

  return useMemo(
    () => ({
      kind: "rowSelection" as const,
      state: { rowSelection: state },
      options: {
        enableRowSelection: enabled && enableRowSelection,
        enableMultiRowSelection: enabled && mode === "multi",
        enableSubRowSelection,
        onRowSelectionChange: enabled ? setState : undefined,
      },
      meta: { mode },
    }),
    [state, setState, enabled, mode, enableRowSelection, enableSubRowSelection],
  );
};
