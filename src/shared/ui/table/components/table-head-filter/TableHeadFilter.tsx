import { cn } from "@shared/lib/utils";
import type { Column } from "@tanstack/react-table";
import { Filter } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../../../popover";
import { getColumnLabel, stopRowClick } from "../../utils";
import { useTableContext } from "../table-context";
import { tableIconButtonVariants } from "../table-variants";
import type { ColumnFilterConfig, FilterControl } from "./filter-registry";
import { FILTER_CONTROLS } from "./filter-registry";

interface TableHeadFilterProps<TData> {
  column: Column<TData, unknown>;
}

const isFilterActive = (value: unknown): boolean => {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;

  return String(value).trim().length > 0;
};

export const TableHeadFilter = <TData,>({
  column,
}: TableHeadFilterProps<TData>) => {
  const { labels } = useTableContext();
  const config = column.columnDef.meta?.filter as
    ColumnFilterConfig | undefined;

  if (!config) return null;

  const active = isFilterActive(column.getFilterValue());
  // Реестр типизирован по `type`, но TS не сужает пару «компонент + config» из union.
  const Control = FILTER_CONTROLS[
    config.type
  ] as FilterControl<ColumnFilterConfig>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={labels.columnFilter(getColumnLabel(column))}
          aria-pressed={active}
          className={cn(tableIconButtonVariants({ active }), "relative")}
          onClick={stopRowClick}
        >
          <Filter
            className={cn(
              "h-3.5 w-3.5 transition-opacity",
              !active && "opacity-40",
            )}
          />
          {active && (
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto min-w-56 max-w-xs p-3">
        <Control config={config} column={column} />
      </PopoverContent>
    </Popover>
  );
};
