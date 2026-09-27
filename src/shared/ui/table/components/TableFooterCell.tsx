import { cn } from "@shared/lib/utils";
import { flexRender, type Header } from "@tanstack/react-table";

import { getColumnAlign, getColumnWidthStyle, getPinningStyle } from "../utils";
import { TableCell } from "./primitives";

interface TableFooterCellProps<TData> {
  header: Header<TData, unknown>;
  resizable?: boolean;
}

/** Ячейка футера: те же ширина, закрепление и выравнивание, что у колонки. */
export const TableFooterCell = <TData,>({
  header,
  resizable,
}: TableFooterCellProps<TData>) => {
  const { column } = header;
  const pin = getPinningStyle(column);
  const align = getColumnAlign(column);
  const content = header.isPlaceholder
    ? null
    : flexRender(column.columnDef.footer, header.getContext());

  return (
    <TableCell
      colSpan={header.colSpan}
      className={cn(pin.className, align.cell)}
      style={{ ...getColumnWidthStyle(column, resizable), ...pin.style }}
    >
      {content}
    </TableCell>
  );
};
