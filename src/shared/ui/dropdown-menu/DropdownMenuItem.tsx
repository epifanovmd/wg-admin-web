import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  MENU_ITEM_ICON_CLASS,
  type MenuItemVariantProps,
  menuItemVariants,
} from "../foundation";
import { DropdownMenuShortcut } from "./DropdownMenuShortcut";

export interface DropdownMenuItemProps
  extends
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    MenuItemVariantProps {
  /** Иконка слева от подписи. С `asChild` не рендерится — её кладут в дочерний элемент. */
  icon?: React.ReactNode;
  /** Клавиатурное сочетание у правого края. С `asChild` не рендерится. */
  shortcut?: React.ReactNode;
}

/** Пункт меню: `variant` default/destructive, `inset` под колонку индикаторов. */
const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(
  (
    { className, variant, inset, icon, shortcut, asChild, children, ...props },
    ref,
  ) => {
    const content = asChild ? (
      children
    ) : (
      <>
        {icon && (
          <span aria-hidden className={MENU_ITEM_ICON_CLASS}>
            {icon}
          </span>
        )}
        {children}
        {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
      </>
    );

    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        asChild={asChild}
        className={cn(menuItemVariants({ variant, inset }), className)}
        {...props}
      >
        {content}
      </DropdownMenuPrimitive.Item>
    );
  },
);

DropdownMenuItem.displayName = "DropdownMenuItem";

export { DropdownMenuItem };
