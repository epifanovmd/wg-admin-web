import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_CONTENT_CLASS } from "../foundation";

export interface ContextMenuSubContentProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.SubContent
> {
  /** Контейнер портала; по умолчанию `document.body`. */
  container?: React.ComponentPropsWithoutRef<
    typeof ContextMenuPrimitive.Portal
  >["container"];
}

const RADIX_SIZE_CLASS =
  "max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) shadow-lg";

/** Панель вложенного меню. */
const ContextMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  ContextMenuSubContentProps
>(
  (
    { className, sideOffset = 4, collisionPadding = 8, container, ...props },
    ref,
  ) => (
    <ContextMenuPrimitive.Portal container={container}>
      <ContextMenuPrimitive.SubContent
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(MENU_CONTENT_CLASS, RADIX_SIZE_CLASS, className)}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  ),
);

ContextMenuSubContent.displayName = "ContextMenuSubContent";

export { ContextMenuSubContent };
