import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_FOOTER_CLASS } from "../../foundation/dialog-parts";

export type DrawerFooterProps = React.HTMLAttributes<HTMLDivElement>;

const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-auto", DIALOG_FOOTER_CLASS, className)}
      {...props}
    />
  ),
);

DrawerFooter.displayName = "DrawerFooter";

export { DrawerFooter };
