import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import {
  progressBarVariants,
  progressTrackVariants,
} from "./progress-variants";

export interface ProgressProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressTrackVariants>,
    Omit<VariantProps<typeof progressBarVariants>, "indeterminate"> {
  /** Доля от 0 до 1; не нужна в режиме `indeterminate`. */
  value?: number;
  /** Неопределённый прогресс — бегущая полоса. */
  indeterminate?: boolean;
}

const toPercent = (value: number | undefined): number =>
  Math.round(Math.max(0, Math.min(1, value ?? 0)) * 100);

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { value, indeterminate = false, size, variant, className, ...props },
    ref,
  ) => {
    const percent = toPercent(value);
    const barStyle = indeterminate ? undefined : { width: `${percent}%` };

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : percent}
        className={cn(progressTrackVariants({ size }), className)}
        {...props}
      >
        <div
          className={progressBarVariants({ variant, indeterminate })}
          style={barStyle}
        />
      </div>
    );
  },
);

Progress.displayName = "Progress";

export { Progress };
