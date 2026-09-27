import { cn } from "@shared/lib/utils";
import { type Cell, flexRender } from "@tanstack/react-table";

import { getColumnAlign, getColumnWidthStyle, getPinningStyle } from "../utils";
import { TableCell } from "./primitives";
import { TableGroupedCell } from "./TableGroupedCell";

interface TableDataCellProps<TData> {
  cell: Cell<TData, unknown>;
  resizable?: boolean;
}

const renderContent = <TData,>(cell: Cell<TData, unknown>) => {
  const { columnDef } = cell.column;
  const context = cell.getContext();

  if (cell.getIsPlaceholder()) return null;

  if (cell.getIsGrouped()) return <TableGroupedCell cell={cell} />;

  if (cell.getIsAggregated()) {
    return flexRender(columnDef.aggregatedCell ?? columnDef.cell, context);
  }

  return flexRender(columnDef.cell, context);
};

export const TableDataCell = <TData,>({
  cell,
  resizable,
}: TableDataCellProps<TData>) => {
  const pin = getPinningStyle(cell.column);
  const align = getColumnAlign(cell.column);

  return (
    <TableCell
      className={cn(pin.className, align.cell)}
      style={{ ...getColumnWidthStyle(cell.column, resizable), ...pin.style }}
    >
      {renderContent(cell)}
    </TableCell>
  );
};
