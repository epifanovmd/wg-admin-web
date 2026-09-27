import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_SEPARATOR_CLASS } from "../foundation";

export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
>;

/** Горизонтальный разделитель групп пунктов. */
const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(MENU_SEPARATOR_CLASS, className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export { DropdownMenuSeparator };
