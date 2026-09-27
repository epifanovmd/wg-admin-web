import { cn } from "@shared/lib/utils";
import * as React from "react";

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, ...props }, ref) => (
    <tr
      ref={ref}
      data-state={selected ? "selected" : undefined}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-primary/5",
        className,
      )}
      {...props}
    />
  ),
);

TableRow.displayName = "TableRow";

export { TableRow };
