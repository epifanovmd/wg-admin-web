import { cn } from "@shared/lib/utils";
import { type Cell, flexRender } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { MouseEvent } from "react";

import { useTableContext } from "./table-context";
import { tableIconButtonVariants } from "./table-variants";

interface TableGroupedCellProps<TData> {
  cell: Cell<TData, unknown>;
}

/** Ячейка строки-группы: переключатель раскрытия, значение и число вложенных строк. */
export const TableGroupedCell = <TData,>({
  cell,
}: TableGroupedCellProps<TData>) => {
  const { labels } = useTableContext();
  const { row } = cell;
  const expanded = row.getIsExpanded();

  const handleToggle = (event: MouseEvent) => {
    event.stopPropagation();
    row.getToggleExpandedHandler()();
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        aria-label={expanded ? labels.collapseRow : labels.expandRow}
        aria-expanded={expanded}
        className={tableIconButtonVariants()}
        onClick={handleToggle}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            expanded && "rotate-90",
          )}
        />
      </button>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
      <span className="text-xs text-muted-foreground">
        ({row.subRows.length})
      </span>
    </span>
  );
};
