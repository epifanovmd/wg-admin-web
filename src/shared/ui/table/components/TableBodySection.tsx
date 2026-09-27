import { useInfiniteScrollSentinel } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import type { ColumnSizingState, Row } from "@tanstack/react-table";
import { Fragment, type ReactNode, type RefObject } from "react";

import { Empty } from "../../empty";
import { Spinner } from "../../spinner";
import type { InfiniteScrollFeatureMeta } from "../hooks/features/types";
import type {
  TableProps,
  TableRowClickHandler,
  TableVirtualOptions,
} from "../table.types";
import { TableBody } from "./primitives";
import { useTableContext } from "./table-context";
import { TableDataRow } from "./TableDataRow";
import { TableExpandedRow } from "./TableExpandedRow";
import { TableStatusRow } from "./TableStatusRow";
import { TableVirtualRows } from "./TableVirtualRows";

interface TableBodySectionProps<TData> {
  rows: Row<TData>[];
  totalColumns: number;
  columnSizing: ColumnSizingState;
  loading?: boolean;
  refreshing?: boolean;
  error?: ReactNode;
  empty?: ReactNode;
  onRowClick?: TableRowClickHandler<TData>;
  onRowDoubleClick?: TableRowClickHandler<TData>;
  rowClassName?: string | ((row: TData) => string);
  getRowProps?: TableProps<TData>["getRowProps"];
  renderSubComponent?: (props: { row: Row<TData> }) => ReactNode;
  className?: string;
  resizable?: boolean;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  infiniteScroll?: InfiniteScrollFeatureMeta;
  /** Виртуализация строк; нужен `scrollContainerRef`. */
  virtual?: Required<TableVirtualOptions>;
}

const NOOP = () => {};

const CENTERED_CLASS = "flex items-center justify-center";

export const TableBodySection = <TData,>({
  rows,
  totalColumns,
  columnSizing,
  loading,
  refreshing,
  error,
  empty,
  onRowClick,
  onRowDoubleClick,
  rowClassName,
  getRowProps,
  renderSubComponent,
  className,
  resizable,
  scrollContainerRef,
  infiniteScroll,
  virtual,
}: TableBodySectionProps<TData>) => {
  const { labels } = useTableContext();
  // Наблюдатель зависит от того, смонтирован ли сторожевой ряд: иначе после
  // первой загрузки `hasNextPage` не меняется и эффект не перезапускается.
  const sentinelVisible =
    !loading && !error && rows.length > 0 && !!infiniteScroll?.hasNextPage;
  const sentinelRef = useInfiniteScrollSentinel<HTMLTableRowElement>({
    rootRef: scrollContainerRef,
    hasNextPage: sentinelVisible,
    isFetchingNextPage: infiniteScroll?.isFetchingNextPage ?? false,
    onLoadMore: infiniteScroll?.onLoadMore ?? NOOP,
    rootMargin: infiniteScroll?.rootMargin,
  });
  const busy = loading || refreshing ? true : undefined;

  if (loading) {
    return (
      <TableBody className={className} aria-busy={busy}>
        <TableStatusRow colSpan={totalColumns} cellClassName="h-24">
          <div className={CENTERED_CLASS}>
            <Spinner size="md" variant="muted" />
          </div>
        </TableStatusRow>
      </TableBody>
    );
  }

  if (error) {
    const errorContent =
      error === true ? (
        <Empty size="sm" title={labels.error} icon="question" />
      ) : (
        error
      );

    return (
      <TableBody className={className}>
        <TableStatusRow colSpan={totalColumns} role="alert">
          {errorContent}
        </TableStatusRow>
      </TableBody>
    );
  }

  if (rows.length === 0) {
    return (
      <TableBody className={className}>
        <TableStatusRow colSpan={totalColumns}>
          {empty ?? <Empty size="sm" title={labels.empty} icon="inbox" />}
        </TableStatusRow>
      </TableBody>
    );
  }

  const rowsNode =
    virtual && scrollContainerRef ? (
      <TableVirtualRows
        rows={rows}
        totalColumns={totalColumns}
        columnSizing={columnSizing}
        scrollContainerRef={scrollContainerRef}
        options={virtual}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        rowClassName={rowClassName}
        getRowProps={getRowProps}
        renderSubComponent={renderSubComponent}
        resizable={resizable}
      />
    ) : (
      rows.map(row => (
        <Fragment key={row.id}>
          <TableDataRow
            row={row}
            cells={row.getVisibleCells()}
            columnSizing={columnSizing}
            isSelected={row.getIsSelected()}
            isExpanded={row.getIsExpanded()}
            onRowClick={onRowClick}
            onRowDoubleClick={onRowDoubleClick}
            className={rowClassName}
            getRowProps={getRowProps}
            resizable={resizable}
          />

          {row.getIsExpanded() && renderSubComponent && (
            <TableExpandedRow
              row={row}
              colSpan={totalColumns}
              renderSubComponent={renderSubComponent}
            />
          )}
        </Fragment>
      ))
    );

  return (
    <TableBody
      aria-busy={busy}
      className={cn(
        "transition-opacity duration-150",
        refreshing && "pointer-events-none opacity-50",
        className,
      )}
    >
      {rowsNode}

      {sentinelVisible && (
        <TableStatusRow
          ref={sentinelRef}
          colSpan={totalColumns}
          cellClassName="h-10"
        >
          {infiniteScroll?.isFetchingNextPage && (
            <div className={cn(CENTERED_CLASS, "py-2")}>
              <Spinner size="sm" variant="muted" />
            </div>
          )}
        </TableStatusRow>
      )}
    </TableBody>
  );
};
