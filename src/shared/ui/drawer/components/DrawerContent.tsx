import { cn } from "@shared/lib/utils";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { useDrawerDirection } from "./drawer-context";
import { DRAWER_HANDLE_CLASS, drawerContentVariants } from "./drawer-variants";
import { DrawerOverlay } from "./DrawerOverlay";

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Content
> {
  /** Скрыть ручку свайпа у вертикальной панели. */
  hideHandle?: boolean;
}

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Content>,
  DrawerContentProps
>(({ className, children, hideHandle, ...props }, ref) => {
  const direction = useDrawerDirection();
  const handleClass =
    direction === "top" || direction === "bottom"
      ? DRAWER_HANDLE_CLASS[direction]
      : undefined;
  const handleNode =
    handleClass && !hideHandle ? (
      <div aria-hidden className={handleClass} />
    ) : null;

  return (
    <DrawerPrimitive.Portal>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(drawerContentVariants({ direction }), className)}
        {...props}
      >
        {handleNode}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
});

DrawerContent.displayName = "DrawerContent";

export { DrawerContent };
