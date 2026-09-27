import { cn } from "@shared/lib/utils";
import * as React from "react";

import { DIALOG_FOOTER_CLASS } from "../../foundation/dialog-parts";

export type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>;

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(DIALOG_FOOTER_CLASS, className)} {...props} />
  ),
);

ModalFooter.displayName = "ModalFooter";

export { ModalFooter };
