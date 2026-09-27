import type { CheckedState } from "@radix-ui/react-checkbox";
import type { ColumnDef, Row, Table } from "@tanstack/react-table";

import { Checkbox } from "../../checkbox";
import type { TableLabels } from "../constants";
import { stopRowClick } from "../utils";

export interface SelectionColumnOptions {
  checkboxSize: "sm" | "md";
  multi: boolean;
  labels: Pick<TableLabels, "selectAll" | "selectRow">;
}

export const SELECTION_COLUMN_ID = "__selection__";

const isChecked = (state: CheckedState) => state === true;

export const buildSelectionColumn = <TData,>({
  checkboxSize,
  multi,
  labels,
}: SelectionColumnOptions): ColumnDef<TData> => ({
  id: SELECTION_COLUMN_ID,
  size: 32,
  maxSize: 32,
  enableSorting: false,
  enableGlobalFilter: false,
  enableColumnFilter: false,
  enableHiding: false,
  header: multi
    ? ({ table }: { table: Table<TData> }) => (
        <Checkbox
          size={checkboxSize}
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={state =>
            table.toggleAllPageRowsSelected(isChecked(state))
          }
          aria-label={labels.selectAll}
        />
      )
    : undefined,
  cell: ({ row }: { row: Row<TData> }) => (
    <Checkbox
      size={checkboxSize}
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onCheckedChange={state => row.toggleSelected(isChecked(state))}
      onClick={stopRowClick}
      aria-label={labels.selectRow}
    />
  ),
});
