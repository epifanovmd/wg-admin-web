import { cn } from "@shared/lib/utils";
import * as React from "react";

import { TableContext } from "../table-context";
import { tableVariants } from "../table-variants";

const TableRoot = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(TableContext);

  return (
    <table
      ref={ref}
      data-variant={variant}
      className={cn(tableVariants({ variant }), className)}
      {...props}
    />
  );
});

TableRoot.displayName = "TableRoot";

export { TableRoot };
