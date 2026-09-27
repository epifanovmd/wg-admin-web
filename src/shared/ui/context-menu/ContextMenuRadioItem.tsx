import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@shared/lib/utils";
import { Circle } from "lucide-react";
import * as React from "react";

import {
  MENU_CHECKABLE_ITEM_CLASS,
  MENU_ITEM_INDICATOR_CLASS,
} from "../foundation";
import { ContextMenuShortcut } from "./ContextMenuShortcut";

export interface ContextMenuRadioItemProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.RadioItem
> {
  /** Клавиатурное сочетание у правого края. */
  shortcut?: React.ReactNode;
}

const DOT_CLASS = "size-2! fill-current";

/** Пункт выбора внутри `ContextMenuRadioGroup`. */
const ContextMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
  ContextMenuRadioItemProps
>(({ className, shortcut, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(MENU_CHECKABLE_ITEM_CLASS, className)}
    {...props}
  >
    <span className={MENU_ITEM_INDICATOR_CLASS}>
      <ContextMenuPrimitive.ItemIndicator>
        <Circle aria-hidden className={DOT_CLASS} />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
    {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
  </ContextMenuPrimitive.RadioItem>
));

ContextMenuRadioItem.displayName = "ContextMenuRadioItem";

export { ContextMenuRadioItem };
