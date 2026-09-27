import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_HEADER_CLASS } from "../../foundation/dialog-parts";

export type ModalHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(DIALOG_HEADER_CLASS, className)} {...props} />
  ),
);

ModalHeader.displayName = "ModalHeader";

export { ModalHeader };
