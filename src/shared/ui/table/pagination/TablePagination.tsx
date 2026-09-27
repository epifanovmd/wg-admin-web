import { cn } from "@shared/lib/utils";
import { useMemo } from "react";

import { Pagination } from "../../pagination";
import { Select } from "../../select";
import { useTableContext } from "../components/table-context";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "../constants";
import type { TanstackTable } from "../table.types";

export interface TablePaginationProps<TData> {
  table: TanstackTable<TData>;
  pageSizeOptions?: readonly number[];
  className?: string;
  /** Селект размера страницы; по умолчанию показан. */
  showPageSize?: boolean;
  /** Общее количество строк рядом с номером страницы. */
  showRowCount?: boolean;
}

export const TablePagination = <TData,>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
  showPageSize = true,
  showRowCount = false,
}: TablePaginationProps<TData>) => {
  const { labels } = useTableContext();
  // При пустых данных tanstack отдаёт 0 страниц — для пользователя это всё равно «1 из 1».
  const totalPages = Math.max(table.getPageCount(), 1);
  const { pagination } = table.getState();
  const rowCount = table.getRowCount();

  const options = useMemo(
    () =>
      pageSizeOptions.map(size => ({
        value: String(size),
        label: labels.perPage(size),
      })),
    [pageSizeOptions, labels],
  );

  return (
    <div
      className={cn("flex items-center justify-between gap-3 p-4", className)}
    >
      <p className="text-xs text-muted-foreground">
        {labels.page(pagination.pageIndex + 1, totalPages)}
        {showRowCount && ` · ${labels.rowCount(rowCount)}`}
      </p>

      <div className="flex items-center gap-3">
        <Pagination
          currentPage={pagination.pageIndex + 1}
          totalPages={totalPages}
          onPageChange={page => table.setPageIndex(page - 1)}
          size="sm"
        />
        {showPageSize && (
          <Select
            options={options}
            value={String(pagination.pageSize)}
            onChange={(v: string) => table.setPageSize(Number(v))}
            size="sm"
            dropdownWidth="auto"
          />
        )}
      </div>
    </div>
  );
};
