import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@shared/lib/utils";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import {
  MENU_ITEM_ICON_CLASS,
  MENU_SUB_TRIGGER_CHEVRON_CLASS,
  MENU_SUB_TRIGGER_OPEN_CLASS,
  menuItemVariants,
} from "../foundation";

export interface ContextMenuSubTriggerProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.SubTrigger
> {
  /** Отступ под колонку индикаторов. */
  inset?: boolean;
  /** Иконка слева от подписи. */
  icon?: React.ReactNode;
}

/** Пункт, раскрывающий вложенное меню (стрелкой вправо или наведением). */
const ContextMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  ContextMenuSubTriggerProps
>(({ className, inset, icon, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      menuItemVariants({ inset }),
      MENU_SUB_TRIGGER_OPEN_CLASS,
      className,
    )}
    {...props}
  >
    {icon && (
      <span aria-hidden className={MENU_ITEM_ICON_CLASS}>
        {icon}
      </span>
    )}
    {children}
    <ChevronRight aria-hidden className={MENU_SUB_TRIGGER_CHEVRON_CLASS} />
  </ContextMenuPrimitive.SubTrigger>
));

ContextMenuSubTrigger.displayName = "ContextMenuSubTrigger";

export { ContextMenuSubTrigger };
