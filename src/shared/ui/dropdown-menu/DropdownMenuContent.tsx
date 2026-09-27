import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_CONTENT_CLASS } from "../foundation";

export interface DropdownMenuContentProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> {
  /** Контейнер портала; по умолчанию `document.body`. */
  container?: React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.Portal
  >["container"];
}

const RADIX_SIZE_CLASS =
  "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)";

/** Панель меню в портале с анимацией появления со стороны триггера. */
const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(
  (
    {
      className,
      align = "start",
      sideOffset = 6,
      collisionPadding = 8,
      container,
      ...props
    },
    ref,
  ) => (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(MENU_CONTENT_CLASS, RADIX_SIZE_CLASS, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  ),
);

DropdownMenuContent.displayName = "DropdownMenuContent";

export { DropdownMenuContent };
