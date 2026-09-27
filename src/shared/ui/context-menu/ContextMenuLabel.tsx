import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_LABEL_CLASS, MENU_LABEL_INSET_CLASS } from "../foundation";

export interface ContextMenuLabelProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.Label
> {
  /** Отступ под колонку индикаторов, чтобы подпись встала вровень с пунктами. */
  inset?: boolean;
}

/** Невыбираемая подпись группы пунктов. */
const ContextMenuLabel = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Label>,
  ContextMenuLabelProps
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(MENU_LABEL_CLASS, inset && MENU_LABEL_INSET_CLASS, className)}
    {...props}
  />
));

ContextMenuLabel.displayName = "ContextMenuLabel";

export { ContextMenuLabel };
