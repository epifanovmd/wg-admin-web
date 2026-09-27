import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_SEPARATOR_CLASS } from "../foundation";

export type ContextMenuSeparatorProps = React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.Separator
>;

/** Горизонтальный разделитель групп пунктов. */
const ContextMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
  ContextMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn(MENU_SEPARATOR_CLASS, className)}
    {...props}
  />
));

ContextMenuSeparator.displayName = "ContextMenuSeparator";

export { ContextMenuSeparator };
