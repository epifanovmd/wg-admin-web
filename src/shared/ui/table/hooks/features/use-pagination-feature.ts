import { useControllableState } from "@shared/lib/hooks";
import {
  getPaginationRowModel,
  type PaginationState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from "../../constants";
import type { TableFeatureOf } from "./types";

export interface PaginationFeatureOptions {
  enabled?: boolean;
  paginationState?: PaginationState;
  defaultPagination?: Partial<PaginationState>;
  onPaginationChange?: (state: PaginationState) => void;
  pageCount?: number;
  rowCount?: number;
  pageSizeOptions?: readonly number[];
  manualPagination?: boolean;
  autoResetPageIndex?: boolean;
}

export const usePaginationFeature = <TData = unknown>(
  options: PaginationFeatureOptions = {},
): TableFeatureOf<TData, "pagination"> => {
  const {
    enabled = true,
    paginationState,
    defaultPagination,
    onPaginationChange,
    pageCount,
    rowCount,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    manualPagination,
    autoResetPageIndex,
  } = options;

  const [defaultValue] = useState<PaginationState>(() => ({
    pageIndex: defaultPagination?.pageIndex ?? 0,
    pageSize: defaultPagination?.pageSize ?? DEFAULT_PAGE_SIZE,
  }));

  const [state, setState] = useControllableState<PaginationState>({
    value: paginationState,
    defaultValue,
    onChange: onPaginationChange,
  });

  return useMemo(
    () => ({
      kind: "pagination" as const,
      state: { pagination: state },
      options: {
        manualPagination,
        autoResetPageIndex,
        pageCount,
        rowCount,
        onPaginationChange: enabled ? setState : undefined,
        getPaginationRowModel:
          enabled && !manualPagination
            ? getPaginationRowModel<TData>()
            : undefined,
      },
      meta: { pageSizeOptions },
    }),
    [
      enabled,
      state,
      setState,
      manualPagination,
      autoResetPageIndex,
      pageCount,
      rowCount,
      pageSizeOptions,
    ],
  );
};
