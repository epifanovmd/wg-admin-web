import { cn } from "@shared/lib/utils";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { MouseEvent } from "react";

import { tableIconButtonVariants } from "../components/table-variants";
import type { TableLabels } from "../constants";

export interface ExpandColumnOptions {
  labels: Pick<TableLabels, "expandRow" | "collapseRow">;
}

const DEPTH_INDENT_PX = 16;

export const EXPAND_COLUMN_ID = "__expand__";

export const buildExpandColumn = <TData,>({
  labels,
}: ExpandColumnOptions): ColumnDef<TData> => ({
  id: EXPAND_COLUMN_ID,
  size: 32,
  maxSize: 32,
  enableSorting: false,
  enableGlobalFilter: false,
  enableColumnFilter: false,
  enableHiding: false,
  cell: ({ row }: { row: Row<TData> }) => {
    if (!row.getCanExpand()) return null;

    const expanded = row.getIsExpanded();

    const handleClick = (event: MouseEvent) => {
      event.stopPropagation();
      row.getToggleExpandedHandler()();
    };

    return (
      <button
        type="button"
        aria-label={expanded ? labels.collapseRow : labels.expandRow}
        aria-expanded={expanded}
        className={tableIconButtonVariants()}
        style={{ marginLeft: row.depth * DEPTH_INDENT_PX }}
        onClick={handleClick}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            expanded && "rotate-90",
          )}
        />
      </button>
    );
  },
});
