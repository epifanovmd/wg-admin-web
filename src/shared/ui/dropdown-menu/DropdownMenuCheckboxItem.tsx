import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@shared/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";

import {
  MENU_CHECKABLE_ITEM_CLASS,
  MENU_ITEM_INDICATOR_CLASS,
} from "../foundation";
import { DropdownMenuShortcut } from "./DropdownMenuShortcut";

export interface DropdownMenuCheckboxItemProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.CheckboxItem
> {
  /** Клавиатурное сочетание у правого края. */
  shortcut?: React.ReactNode;
}

/** Пункт-переключатель с галочкой (`checked` / `onCheckedChange`). */
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, shortcut, children, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(MENU_CHECKABLE_ITEM_CLASS, className)}
    {...props}
  >
    <span className={MENU_ITEM_INDICATOR_CLASS}>
      <DropdownMenuPrimitive.ItemIndicator>
        <Check aria-hidden />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
    {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
  </DropdownMenuPrimitive.CheckboxItem>
));

DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export { DropdownMenuCheckboxItem };
