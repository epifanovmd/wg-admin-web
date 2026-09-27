import { cn } from "@shared/lib/utils";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { DIALOG_OVERLAY_CLASS } from "../../foundation/dialog-parts";

export type DrawerOverlayProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Overlay
>;

const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Overlay>,
  DrawerOverlayProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(DIALOG_OVERLAY_CLASS, className)}
    {...props}
  />
));

DrawerOverlay.displayName = "DrawerOverlay";

export { DrawerOverlay };
