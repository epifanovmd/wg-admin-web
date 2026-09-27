import { cn } from "@shared/lib/utils";
import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { DIALOG_DESCRIPTION_CLASS } from "../../foundation/dialog-parts";

export type DrawerDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DrawerPrimitive.Description
>;

const DrawerDescription = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Description>,
  DrawerDescriptionProps
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn(DIALOG_DESCRIPTION_CLASS, className)}
    {...props}
  />
));

DrawerDescription.displayName = "DrawerDescription";

export { DrawerDescription };
