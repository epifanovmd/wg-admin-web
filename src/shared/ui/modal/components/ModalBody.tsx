import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_BODY_CLASS } from "../../foundation/dialog-parts";

export type ModalBodyProps = React.HTMLAttributes<HTMLDivElement>;

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(DIALOG_BODY_CLASS, className)} {...props} />
  ),
);

ModalBody.displayName = "ModalBody";

export { ModalBody };
