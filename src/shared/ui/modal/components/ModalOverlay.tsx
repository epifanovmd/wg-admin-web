import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_OVERLAY_CLASS } from "../../foundation/dialog-parts";

export type ModalOverlayProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
>;

const ModalOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  ModalOverlayProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      DIALOG_OVERLAY_CLASS,
      "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));

ModalOverlay.displayName = "ModalOverlay";

export { ModalOverlay };
