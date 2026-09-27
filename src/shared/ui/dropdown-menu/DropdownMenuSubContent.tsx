import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { MENU_CONTENT_CLASS } from "../foundation";

export interface DropdownMenuSubContentProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.SubContent
> {
  /** Контейнер портала; по умолчанию `document.body`. */
  container?: React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.Portal
  >["container"];
}

const RADIX_SIZE_CLASS =
  "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin) shadow-lg";

/** Панель вложенного меню. */
const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(
  (
    { className, sideOffset = 4, collisionPadding = 8, container, ...props },
    ref,
  ) => (
    <DropdownMenuPrimitive.Portal container={container}>
      <DropdownMenuPrimitive.SubContent
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(MENU_CONTENT_CLASS, RADIX_SIZE_CLASS, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  ),
);

DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export { DropdownMenuSubContent };
