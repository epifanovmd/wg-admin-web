import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  TableBodySection,
  TableBulkBar,
  TableColumnVisibility,
  TableContext,
  type TableContextValue,
  TableFooterSection,
  TableHeaderSection,
  TableRoot,
} from "./components";
import {
  TABLE_LABELS,
  VIRTUAL_OVERSCAN,
  VIRTUAL_ROW_ESTIMATE,
} from "./constants";
import { useTableInstance } from "./hooks";
import { TablePagination } from "./pagination";
import type { TableProps, TableSize, TableVirtualOptions } from "./table.types";

const resolveVirtual = (
  virtual: TableProps<unknown>["virtual"],
  size: TableSize,
): Required<TableVirtualOptions> | undefined => {
  if (!virtual) return undefined;

  const options = virtual === true ? {} : virtual;

  return {
    estimateSize: options.estimateSize ?? VIRTUAL_ROW_ESTIMATE[size],
    overscan: options.overscan ?? VIRTUAL_OVERSCAN,
  };
};

export const Table = <TData,>(props: TableProps<TData>) => {
  const {
    data,
    columns,
    features,
    variant = "default",
    size = "md",
    stickyHeader,
    stickyFooter,
    className,
    containerClassName,
    tableClassName,
    headerClassName,
    bodyClassName,
    footerClassName,
    rowClassName,
    toolbar,
    showColumnVisibility,
    labels: labelsOverride,
    caption,
    "aria-label": ariaLabel,
    loading,
    refreshing,
    error,
    empty,
    onRowClick,
    onRowDoubleClick,
    getRowProps,
    getRowId,
    tableOptions,
    bulkActions,
    virtual,
  } = props;

  const labels = React.useMemo(
    () => ({ ...TABLE_LABELS, ...labelsOverride }),
    [labelsOverride],
  );

  const {
    table,
    rows,
    totalColumns,
    hasFooter,
    sortingEnabled,
    filteringEnabled,
    paginationEnabled,
    resizingEnabled,
    pinningEnabled,
    groupingEnabled,
    renderSubComponent,
    pageSizeOptions,
    infiniteScroll,
    selectionEnabled,
  } = useTableInstance<TData>({
    data,
    columns,
    features,
    size,
    getRowId,
    tableOptions,
    labels,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  const contextValue = React.useMemo<TableContextValue>(
    () => ({ size, variant, labels }),
    [size, variant, labels],
  );

  const hasToolbar = !!toolbar || !!showColumnVisibility;

  // Опции часто передают литералом: мемо по примитивам, а не по объекту.
  const { estimateSize, overscan } = resolveVirtual(virtual, size) ?? {};
  const virtualOptions = React.useMemo(
    () =>
      estimateSize === undefined || overscan === undefined
        ? undefined
        : { estimateSize, overscan },
    [estimateSize, overscan],
  );

  return (
    <TableContext.Provider value={contextValue}>
      <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
        {hasToolbar && (
          <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-1.5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {toolbar}
            </div>
            {showColumnVisibility && (
              <TableColumnVisibility
                table={table}
                pinningEnabled={pinningEnabled}
              />
            )}
          </div>
        )}

        {bulkActions && selectionEnabled && (
          <TableBulkBar table={table} bulkActions={bulkActions} />
        )}

        <div
          ref={containerRef}
          className={cn(
            "flex-1 overflow-auto rounded-lg border",
            containerClassName,
          )}
        >
          <TableRoot className={tableClassName} aria-label={ariaLabel}>
            {caption && <caption className="sr-only">{caption}</caption>}
            <TableHeaderSection
              table={table}
              sorting={sortingEnabled}
              filtering={filteringEnabled}
              grouping={groupingEnabled}
              stickyHeader={stickyHeader}
              resizable={resizingEnabled}
              className={headerClassName}
            />
            <TableBodySection
              rows={rows}
              totalColumns={totalColumns}
              columnSizing={table.getState().columnSizing}
              loading={loading}
              refreshing={refreshing}
              error={error}
              empty={empty}
              onRowClick={onRowClick}
              onRowDoubleClick={onRowDoubleClick}
              rowClassName={rowClassName}
              getRowProps={getRowProps}
              renderSubComponent={renderSubComponent}
              className={bodyClassName}
              resizable={resizingEnabled}
              scrollContainerRef={containerRef}
              infiniteScroll={infiniteScroll}
              virtual={virtualOptions}
            />
            {hasFooter && (
              <TableFooterSection
                table={table}
                stickyFooter={stickyFooter}
                resizable={resizingEnabled}
                className={footerClassName}
              />
            )}
          </TableRoot>
        </div>

        {paginationEnabled && (
          <TablePagination table={table} pageSizeOptions={pageSizeOptions} />
        )}
      </div>
    </TableContext.Provider>
  );
};
