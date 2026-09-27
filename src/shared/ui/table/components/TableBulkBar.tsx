import { X } from "lucide-react";

import { Button } from "../../button";
import type { TableBulkActionsRenderer, TanstackTable } from "../table.types";
import { useTableContext } from "./table-context";

interface TableBulkBarProps<TData> {
  table: TanstackTable<TData>;
  bulkActions: TableBulkActionsRenderer<TData>;
}

const BAR_CLASS =
  "sticky top-0 z-30 flex shrink-0 flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5";

/** Панель массовых действий: видна, пока выбрана хотя бы одна строка. */
export const TableBulkBar = <TData,>({
  table,
  bulkActions,
}: TableBulkBarProps<TData>) => {
  const { labels } = useTableContext();
  const rows = table.getSelectedRowModel().rows;

  if (rows.length === 0) return null;

  const clear = () => table.resetRowSelection(true);

  return (
    <div role="toolbar" aria-label={labels.bulkActions} className={BAR_CLASS}>
      <span
        aria-live="polite"
        className="text-sm font-medium text-foreground tabular-nums"
      >
        {labels.selectedCount(rows.length)}
      </span>

      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        {bulkActions({ rows, clear })}
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={clear}>
        <X size={14} aria-hidden />
        {labels.clearSelection}
      </Button>
    </div>
  );
};
