import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_TITLE_CLASS } from "../../foundation/dialog-parts";

export type ModalTitleProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Title
>;

const ModalTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  ModalTitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(DIALOG_TITLE_CLASS, className)}
    {...props}
  />
));

ModalTitle.displayName = "ModalTitle";

export { ModalTitle };
