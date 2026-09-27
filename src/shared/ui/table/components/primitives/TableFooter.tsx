import { cn } from "@shared/lib/utils";
import * as React from "react";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t font-medium [&_tr]:bg-muted/50 [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
));

TableFooter.displayName = "TableFooter";

export { TableFooter };
