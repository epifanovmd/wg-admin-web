import { cn } from "@shared/lib/utils";

import type { TanstackTable } from "../table.types";
import { TableFooter, TableRow } from "./primitives";
import { TableFooterCell } from "./TableFooterCell";

interface TableFooterSectionProps<TData> {
  table: TanstackTable<TData>;
  stickyFooter?: boolean;
  resizable?: boolean;
  className?: string;
}

const STICKY_CLASS =
  "sticky bottom-0 z-20 bg-card shadow-[0_-1px_0_0_var(--color-border)]";

export const TableFooterSection = <TData,>({
  table,
  stickyFooter,
  resizable,
  className,
}: TableFooterSectionProps<TData>) => (
  <TableFooter className={cn(stickyFooter && STICKY_CLASS, className)}>
    {table.getFooterGroups().map(footerGroup => (
      <TableRow key={footerGroup.id}>
        {footerGroup.headers.map(header => (
          <TableFooterCell
            key={header.id}
            header={header}
            resizable={resizable}
          />
        ))}
      </TableRow>
    ))}
  </TableFooter>
);
