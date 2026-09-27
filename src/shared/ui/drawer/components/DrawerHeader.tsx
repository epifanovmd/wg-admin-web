import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_HEADER_CLASS } from "../../foundation/dialog-parts";

export type DrawerHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(DIALOG_HEADER_CLASS, className)} {...props} />
  ),
);

DrawerHeader.displayName = "DrawerHeader";

export { DrawerHeader };
