import { useControllableState } from "@shared/lib/hooks";
import {
  type ExpandedState,
  getExpandedRowModel,
  type Row,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useMemo } from "react";

import type { TableFeatureOf } from "./types";

export interface ExpandingFeatureOptions<TData> {
  enabled?: boolean;
  expandedState?: ExpandedState;
  defaultExpanded?: ExpandedState;
  onExpandedChange?: (state: ExpandedState) => void;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  getSubRows?: (row: TData) => TData[] | undefined;
  renderSubComponent?: (props: { row: Row<TData> }) => ReactNode;
}

const DEFAULT_EXPANDED: ExpandedState = {};

const hasSubRows = <TData>(row: Row<TData>) => row.subRows.length > 0;
const always = () => true;

export const useExpandingFeature = <TData = unknown>(
  options: ExpandingFeatureOptions<TData> = {},
): TableFeatureOf<TData, "expanding"> => {
  const {
    enabled = true,
    expandedState,
    defaultExpanded,
    onExpandedChange,
    getRowCanExpand,
    getSubRows,
    renderSubComponent,
  } = options;

  const [state, setState] = useControllableState<ExpandedState>({
    value: expandedState,
    defaultValue: defaultExpanded ?? DEFAULT_EXPANDED,
    onChange: onExpandedChange,
  });

  const resolvedGetRowCanExpand = useMemo(() => {
    if (getRowCanExpand) return getRowCanExpand;
    if (getSubRows) return hasSubRows<TData>;
    if (renderSubComponent) return always;

    return undefined;
  }, [getRowCanExpand, getSubRows, renderSubComponent]);

  return useMemo(
    () => ({
      kind: "expanding" as const,
      state: { expanded: state },
      options: {
        onExpandedChange: enabled ? setState : undefined,
        getExpandedRowModel: enabled ? getExpandedRowModel<TData>() : undefined,
        getRowCanExpand: enabled ? resolvedGetRowCanExpand : undefined,
        getSubRows: enabled ? getSubRows : undefined,
      },
      meta: { renderSubComponent: enabled ? renderSubComponent : undefined },
    }),
    [
      state,
      setState,
      enabled,
      resolvedGetRowCanExpand,
      getSubRows,
      renderSubComponent,
    ],
  );
};
