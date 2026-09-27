import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_LABEL_CLASS, MENU_LABEL_INSET_CLASS } from "../foundation";

export interface DropdownMenuLabelProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
> {
  /** Отступ под колонку индикаторов, чтобы подпись встала вровень с пунктами. */
  inset?: boolean;
}

/** Невыбираемая подпись группы пунктов. */
const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(MENU_LABEL_CLASS, inset && MENU_LABEL_INSET_CLASS, className)}
    {...props}
  />
));

DropdownMenuLabel.displayName = "DropdownMenuLabel";

export { DropdownMenuLabel };
