import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  MENU_ITEM_ICON_CLASS,
  type MenuItemVariantProps,
  menuItemVariants,
} from "../foundation";
import { ContextMenuShortcut } from "./ContextMenuShortcut";

export interface ContextMenuItemProps
  extends
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item>,
    MenuItemVariantProps {
  /** Иконка слева от подписи. С `asChild` не рендерится — её кладут в дочерний элемент. */
  icon?: React.ReactNode;
  /** Клавиатурное сочетание у правого края. С `asChild` не рендерится. */
  shortcut?: React.ReactNode;
}

/** Пункт меню: `variant` default/destructive, `inset` под колонку индикаторов. */
const ContextMenuItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Item>,
  ContextMenuItemProps
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
        {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
      </>
    );

    return (
      <ContextMenuPrimitive.Item
        ref={ref}
        asChild={asChild}
        className={cn(menuItemVariants({ variant, inset }), className)}
        {...props}
      >
        {content}
      </ContextMenuPrimitive.Item>
    );
  },
);

ContextMenuItem.displayName = "ContextMenuItem";

export { ContextMenuItem };
