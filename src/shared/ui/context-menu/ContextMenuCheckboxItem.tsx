import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@shared/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";

import {
  MENU_CHECKABLE_ITEM_CLASS,
  MENU_ITEM_INDICATOR_CLASS,
} from "../foundation";
import { ContextMenuShortcut } from "./ContextMenuShortcut";

export interface ContextMenuCheckboxItemProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.CheckboxItem
> {
  /** Клавиатурное сочетание у правого края. */
  shortcut?: React.ReactNode;
}

/** Пункт-переключатель с галочкой (`checked` / `onCheckedChange`). */
const ContextMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
  ContextMenuCheckboxItemProps
>(({ className, shortcut, children, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(MENU_CHECKABLE_ITEM_CLASS, className)}
    {...props}
  >
    <span className={MENU_ITEM_INDICATOR_CLASS}>
      <ContextMenuPrimitive.ItemIndicator>
        <Check aria-hidden />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
    {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
  </ContextMenuPrimitive.CheckboxItem>
));

ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem";

export { ContextMenuCheckboxItem };
