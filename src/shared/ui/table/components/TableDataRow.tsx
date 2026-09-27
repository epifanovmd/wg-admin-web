import { cn } from "@shared/lib/utils";
import type { Cell, ColumnSizingState, Row } from "@tanstack/react-table";
import * as React from "react";

import type { TableProps, TableRowClickHandler } from "../table.types";
import { TableRow } from "./primitives";
import { TableDataCell } from "./TableDataCell";

interface TableDataRowProps<TData> {
  row: Row<TData>;
  /** `row.getVisibleCells()` — меняет identity при смене порядка/видимости/закрепления колонок. */
  cells: Cell<TData, unknown>[];
  /** Состояние ширин: `cells` на resize не меняются, поэтому нужен отдельный ключ. */
  columnSizing: ColumnSizingState;
  isSelected: boolean;
  /** `row.getIsExpanded()` — сбрасывает memo, чтобы переключатель раскрытия не устаревал. */
  isExpanded: boolean;
  onRowClick?: TableRowClickHandler<TData>;
  onRowDoubleClick?: TableRowClickHandler<TData>;
  className?: string | ((row: TData) => string);
  getRowProps?: TableProps<TData>["getRowProps"];
  resizable?: boolean;
  /** Замер высоты строки виртуализатором. */
  measureRef?: (element: HTMLTableRowElement | null) => void;
  /** Индекс в списке виртуализатора (`data-index` для замера). */
  virtualIndex?: number;
}

const isActivationKey = (key: string) => key === "Enter" || key === " ";

const TableDataRowInner = <TData,>({
  row,
  cells,
  isSelected,
  onRowClick,
  onRowDoubleClick,
  className,
  getRowProps,
  resizable,
  measureRef,
  virtualIndex,
}: TableDataRowProps<TData>) => {
  const resolvedClassName =
    typeof className === "function" ? className(row.original) : className;
  const rowProps = getRowProps?.(row);
  const clickable = !!onRowClick;

  const handleClick = (event: React.MouseEvent<HTMLTableRowElement>) =>
    onRowClick?.(row.original, event);

  const handleDoubleClick = (event: React.MouseEvent<HTMLTableRowElement>) =>
    onRowDoubleClick?.(row.original, event);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.target !== event.currentTarget || !isActivationKey(event.key)) {
      return;
    }

    event.preventDefault();
    onRowClick?.(row.original, event);
  };

  return (
    <TableRow
      {...rowProps}
      ref={measureRef}
      data-index={virtualIndex}
      selected={isSelected}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      onDoubleClick={onRowDoubleClick ? handleDoubleClick : undefined}
      className={cn(
        "group/row",
        clickable &&
          "cursor-pointer focus-visible:outline-none focus-visible:bg-muted/50",
        resolvedClassName,
        rowProps?.className,
      )}
    >
      {cells.map(cell => (
        <TableDataCell key={cell.id} cell={cell} resizable={resizable} />
      ))}
    </TableRow>
  );
};

export const TableDataRow = React.memo(
  TableDataRowInner,
) as typeof TableDataRowInner;
