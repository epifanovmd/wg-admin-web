import { Columns } from "lucide-react";

import { Checkbox } from "../../checkbox";
import { IconButton } from "../../icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";
import type { TanstackTable } from "../table.types";
import { useTableContext } from "./table-context";
import { TableColumnVisibilityItem } from "./TableColumnVisibilityItem";

interface TableColumnVisibilityProps<TData> {
  table: TanstackTable<TData>;
  pinningEnabled?: boolean;
}

export const TableColumnVisibility = <TData,>({
  table,
  pinningEnabled,
}: TableColumnVisibilityProps<TData>) => {
  const { labels } = useTableContext();
  const hideableColumns = table
    .getAllLeafColumns()
    .filter(col => col.getCanHide());
  const allVisible = table.getIsAllColumnsVisible();
  const someVisible = table.getIsSomeColumnsVisible();

  if (hideableColumns.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton
          aria-label={labels.columnVisibility}
          className="border border-input bg-background shadow-sm"
        >
          <Columns className="h-4 w-4" />
        </IconButton>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-64 p-3">
        <div className="space-y-1">
          <label className="mb-1 flex cursor-pointer items-center gap-2 rounded border-b border-border px-1 py-1.5 pb-2 hover:bg-accent/50">
            <Checkbox
              size="sm"
              checked={allVisible}
              indeterminate={!allVisible && someVisible}
              onCheckedChange={() => table.toggleAllColumnsVisible()}
            />
            <span className="text-sm font-medium">{labels.allColumns}</span>
          </label>

          {hideableColumns.map(column => (
            <TableColumnVisibilityItem
              key={column.id}
              column={column}
              pinningEnabled={pinningEnabled}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
