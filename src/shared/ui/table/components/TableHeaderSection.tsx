import { cn } from "@shared/lib/utils";

import type { TanstackTable } from "../table.types";
import { TableHeader, TableRow } from "./primitives";
import { TableHeadCell } from "./TableHeadCell";

interface TableHeaderSectionProps<TData> {
  table: TanstackTable<TData>;
  sorting?: boolean;
  filtering?: boolean;
  grouping?: boolean;
  stickyHeader?: boolean;
  resizable?: boolean;
  className?: string;
}

const STICKY_CLASS =
  "sticky top-0 z-20 bg-card shadow-[0_1px_0_0_var(--color-border)]";

export const TableHeaderSection = <TData,>({
  table,
  sorting,
  filtering,
  grouping,
  stickyHeader,
  resizable,
  className,
}: TableHeaderSectionProps<TData>) => (
  <TableHeader className={cn(stickyHeader && STICKY_CLASS, className)}>
    {table.getHeaderGroups().map(headerGroup => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map(header => (
          <TableHeadCell
            key={header.id}
            header={header}
            sorting={sorting}
            filtering={filtering}
            grouping={grouping}
            resizable={resizable}
          />
        ))}
      </TableRow>
    ))}
  </TableHeader>
);
