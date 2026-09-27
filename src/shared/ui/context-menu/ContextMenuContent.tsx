import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_CONTENT_CLASS } from "../foundation";

export interface ContextMenuContentProps extends React.ComponentPropsWithoutRef<
  typeof ContextMenuPrimitive.Content
> {
  /** Контейнер портала; по умолчанию `document.body`. */
  container?: React.ComponentPropsWithoutRef<
    typeof ContextMenuPrimitive.Portal
  >["container"];
}

const RADIX_SIZE_CLASS =
  "max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin)";

/** Панель контекстного меню в портале; открывается у курсора. */
const ContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  ContextMenuContentProps
>(({ className, collisionPadding = 8, container, ...props }, ref) => (
  <ContextMenuPrimitive.Portal container={container}>
    <ContextMenuPrimitive.Content
      ref={ref}
      collisionPadding={collisionPadding}
      className={cn(MENU_CONTENT_CLASS, RADIX_SIZE_CLASS, className)}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));

ContextMenuContent.displayName = "ContextMenuContent";

export { ContextMenuContent };
