import type { Column } from "@tanstack/react-table";
import { Group, Ungroup } from "lucide-react";
import type { MouseEvent } from "react";

import { useTableContext } from "./table-context";
import { tableIconButtonVariants } from "./table-variants";

interface TableGroupToggleProps<TData> {
  column: Column<TData, unknown>;
}

export const TableGroupToggle = <TData,>({
  column,
}: TableGroupToggleProps<TData>) => {
  const { labels } = useTableContext();
  const grouped = column.getIsGrouped();
  const Icon = grouped ? Ungroup : Group;

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    column.getToggleGroupingHandler()();
  };

  return (
    <button
      type="button"
      aria-label={grouped ? labels.ungroupColumn : labels.groupByColumn}
      aria-pressed={grouped}
      className={tableIconButtonVariants({ active: grouped })}
      onClick={handleClick}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
};
