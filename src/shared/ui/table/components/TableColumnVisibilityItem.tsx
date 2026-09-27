import type { Column, ColumnPinningPosition } from "@tanstack/react-table";
import { ArrowLeftToLine, ArrowRightToLine } from "lucide-react";

import { Checkbox } from "../../checkbox";
import { getColumnLabel } from "../utils";
import { useTableContext } from "./table-context";
import { tableIconButtonVariants } from "./table-variants";

interface TableColumnVisibilityItemProps<TData> {
  column: Column<TData, unknown>;
  pinningEnabled?: boolean;
}

const togglePin = <TData,>(
  column: Column<TData, unknown>,
  side: Exclude<ColumnPinningPosition, false>,
) => column.pin(column.getIsPinned() === side ? false : side);

export const TableColumnVisibilityItem = <TData,>({
  column,
  pinningEnabled,
}: TableColumnVisibilityItemProps<TData>) => {
  const { labels } = useTableContext();
  const pinned = column.getIsPinned();
  const canPin = !!pinningEnabled && column.getCanPin();
  const columnLabel = getColumnLabel(column);
  const pinLeftLabel = `${labels.pinLeft}: ${columnLabel}`;
  const pinRightLabel = `${labels.pinRight}: ${columnLabel}`;

  const handlePinLeft = () => togglePin(column, "left");
  const handlePinRight = () => togglePin(column, "right");

  return (
    <div className="flex items-center gap-2 rounded px-1 py-1.5 transition-colors hover:bg-accent/50">
      <label className="flex flex-1 cursor-pointer items-center gap-2 overflow-hidden">
        <Checkbox
          size="sm"
          checked={column.getIsVisible()}
          onCheckedChange={checked => column.toggleVisibility(checked === true)}
        />
        <span className="truncate text-sm">{columnLabel}</span>
      </label>

      {canPin && (
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            aria-label={pinLeftLabel}
            aria-pressed={pinned === "left"}
            className={tableIconButtonVariants({ active: pinned === "left" })}
            onClick={handlePinLeft}
          >
            <ArrowLeftToLine className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={pinRightLabel}
            aria-pressed={pinned === "right"}
            className={tableIconButtonVariants({ active: pinned === "right" })}
            onClick={handlePinRight}
          >
            <ArrowRightToLine className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
