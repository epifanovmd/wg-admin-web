import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  otpCellVariants,
  type OtpInputVariantProps,
} from "./otp-input-variants";

export interface OtpInputCellProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value">,
    OtpInputVariantProps {
  /** Отображаемый символ ячейки (или «•» в режиме `mask`). */
  value: string;
}

/** Одна ячейка OTP-поля: однострочный input с выравниванием по центру. */
export const OtpInputCell = React.forwardRef<
  HTMLInputElement,
  OtpInputCellProps
>(({ className, size, variant, ...props }, ref) => (
  <input
    ref={ref}
    type="text"
    spellCheck={false}
    autoCapitalize="off"
    autoCorrect="off"
    className={cn(otpCellVariants({ size, variant }), className)}
    data-slot="otp-input-cell"
    {...props}
  />
));

OtpInputCell.displayName = "OtpInputCell";
