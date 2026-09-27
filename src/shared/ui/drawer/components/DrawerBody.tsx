import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_BODY_CLASS } from "../../foundation/dialog-parts";

export type DrawerBodyProps = React.HTMLAttributes<HTMLDivElement>;

const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(DIALOG_BODY_CLASS, className)} {...props} />
  ),
);

DrawerBody.displayName = "DrawerBody";

export { DrawerBody };
