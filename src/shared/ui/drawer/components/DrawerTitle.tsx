import { cn } from "@shared/lib/utils";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { DIALOG_TITLE_CLASS } from "../../foundation/dialog-parts";

export type DrawerTitleProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Title
>;

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Title>,
  DrawerTitleProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn(DIALOG_TITLE_CLASS, className)}
    {...props}
  />
));

DrawerTitle.displayName = "DrawerTitle";

export { DrawerTitle };
