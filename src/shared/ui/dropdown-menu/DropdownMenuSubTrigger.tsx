import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@shared/lib/utils";
import { ChevronRight } from "lucide-react";
import * as React from "react";

import {
  MENU_ITEM_ICON_CLASS,
  MENU_SUB_TRIGGER_CHEVRON_CLASS,
  MENU_SUB_TRIGGER_OPEN_CLASS,
  menuItemVariants,
} from "../foundation";

export interface DropdownMenuSubTriggerProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubTrigger
> {
  /** Отступ под колонку индикаторов. */
  inset?: boolean;
  /** Иконка слева от подписи. */
  icon?: React.ReactNode;
}

/** Пункт, раскрывающий вложенное меню (стрелкой вправо или наведением). */
const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, inset, icon, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
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
  </DropdownMenuPrimitive.SubTrigger>
));

DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export { DropdownMenuSubTrigger };
