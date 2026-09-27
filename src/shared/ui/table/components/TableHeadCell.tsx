import { cn } from "@shared/lib/utils";
import { flexRender, type Header } from "@tanstack/react-table";
import type { AriaAttributes } from "react";

import { INHERIT_FONT_CLASS } from "../../foundation";
import { getColumnAlign, getColumnWidthStyle, getPinningStyle } from "../utils";
import { TableHead } from "./primitives";
import { SortIcon } from "./SortIcon";
import { TableHeadFilter } from "./table-head-filter";
import { TableGroupToggle } from "./TableGroupToggle";
import { TableResizeHandle } from "./TableResizeHandle";

interface TableHeadCellProps<TData> {
  header: Header<TData, unknown>;
  sorting?: boolean;
  filtering?: boolean;
  grouping?: boolean;
  resizable?: boolean;
}

const ARIA_SORT: Record<"asc" | "desc" | "none", AriaAttributes["aria-sort"]> =
  {
    asc: "ascending",
    desc: "descending",
    none: "none",
  };

const HEADER_CONTENT_CLASS = "flex items-center gap-1";

const SORT_BUTTON_CLASS = `${INHERIT_FONT_CLASS} inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-foreground`;

/**
 * Заголовок колонки. Контент `header` при включённой сортировке оборачивается
 * в `<button>`, поэтому должен быть phrasing content (текст, `span`).
 */
export const TableHeadCell = <TData,>({
  header,
  sorting,
  filtering,
  grouping,
  resizable,
}: TableHeadCellProps<TData>) => {
  const { column } = header;
  const widthStyle = getColumnWidthStyle(column, resizable);
  const pin = getPinningStyle(column);
  const align = getColumnAlign(column);
  // `relative` классом, а не inline: inline `position` перебивал бы sticky закреплённой колонки.
  const className = cn("relative", pin.className);
  const style = { ...widthStyle, ...pin.style };

  if (header.isPlaceholder) {
    return (
      <TableHead colSpan={header.colSpan} className={className} style={style} />
    );
  }

  const content = flexRender(column.columnDef.header, header.getContext());
  const canSort = !!sorting && column.getCanSort();
  const canGroup = !!grouping && column.getCanGroup();
  const canFilter = !!filtering && !!column.columnDef.meta?.filter;
  const canResize = !!resizable && column.getCanResize();
  const sortDirection = column.getIsSorted();
  const ariaSort = canSort ? ARIA_SORT[sortDirection || "none"] : undefined;

  const inner = canSort ? (
    <button
      type="button"
      className={SORT_BUTTON_CLASS}
      onClick={column.getToggleSortingHandler()}
    >
      {content}
      <SortIcon direction={sortDirection} />
    </button>
  ) : (
    content
  );

  return (
    <TableHead
      colSpan={header.colSpan}
      aria-sort={ariaSort}
      className={className}
      style={style}
    >
      <div className={cn(HEADER_CONTENT_CLASS, align.header)}>
        {inner}
        {canFilter && <TableHeadFilter column={column} />}
        {canGroup && <TableGroupToggle column={column} />}
      </div>

      {canResize && <TableResizeHandle header={header} />}
    </TableHead>
  );
};
