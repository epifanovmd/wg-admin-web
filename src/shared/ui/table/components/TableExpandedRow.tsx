import type { Row } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { TableCell, TableRow } from "./primitives";

interface TableExpandedRowProps<TData> {
  row: Row<TData>;
  colSpan: number;
  renderSubComponent: (props: { row: Row<TData> }) => ReactNode;
  /** Замер высоты строки виртуализатором. */
  measureRef?: (element: HTMLTableRowElement | null) => void;
  /** Индекс в списке виртуализатора (`data-index` для замера). */
  virtualIndex?: number;
}

export const TableExpandedRow = <TData,>({
  row,
  colSpan,
  renderSubComponent,
  measureRef,
  virtualIndex,
}: TableExpandedRowProps<TData>) => (
  <TableRow
    ref={measureRef}
    data-index={virtualIndex}
    className="hover:bg-transparent"
  >
    <TableCell colSpan={colSpan} className="p-0">
      {renderSubComponent({ row })}
    </TableCell>
  </TableRow>
);
