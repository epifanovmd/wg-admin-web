import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@shared/lib/utils";
import { Circle } from "lucide-react";
import * as React from "react";

import {
  MENU_CHECKABLE_ITEM_CLASS,
  MENU_ITEM_INDICATOR_CLASS,
} from "../foundation";
import { DropdownMenuShortcut } from "./DropdownMenuShortcut";

export interface DropdownMenuRadioItemProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.RadioItem
> {
  /** Клавиатурное сочетание у правого края. */
  shortcut?: React.ReactNode;
}

const DOT_CLASS = "size-2! fill-current";

/** Пункт выбора внутри `DropdownMenuRadioGroup`. */
const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, shortcut, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(MENU_CHECKABLE_ITEM_CLASS, className)}
    {...props}
  >
    <span className={MENU_ITEM_INDICATOR_CLASS}>
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle aria-hidden className={DOT_CLASS} />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
    {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
  </DropdownMenuPrimitive.RadioItem>
));

DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export { DropdownMenuRadioItem };
