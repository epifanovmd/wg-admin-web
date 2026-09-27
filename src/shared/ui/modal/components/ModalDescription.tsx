import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_DESCRIPTION_CLASS } from "../../foundation/dialog-parts";

export type ModalDescriptionProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Description
>;

const ModalDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  ModalDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(DIALOG_DESCRIPTION_CLASS, className)}
    {...props}
  />
));

ModalDescription.displayName = "ModalDescription";

export { ModalDescription };
