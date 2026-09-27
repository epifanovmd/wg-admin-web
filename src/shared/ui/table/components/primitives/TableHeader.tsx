import { cn } from "@shared/lib/utils";
import * as React from "react";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("[&_tr]:border-b [&_tr]:bg-muted/50", className)}
    {...props}
  />
));

TableHeader.displayName = "TableHeader";

export { TableHeader };
