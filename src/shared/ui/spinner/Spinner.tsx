import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { spinnerVariants } from "./spinner-variants";

export interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  /** Видимая подпись рядом с иконкой. */
  label?: React.ReactNode;
  /** Текст для скринридера, когда видимой подписи нет. */
  srLabel?: string;
  /** Классы иконки; `className` идёт на обёртку. */
  iconClassName?: string;
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    {
      className,
      iconClassName,
      size,
      variant,
      label,
      srLabel = "Загрузка…",
      ...props
    },
    ref,
  ) => {
    const hasLabel = label !== undefined && label !== null && label !== "";

    return (
      <span
        ref={ref}
        role="status"
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        <Loader2
          aria-hidden
          className={cn(spinnerVariants({ size, variant }), iconClassName)}
        />
        {hasLabel ? (
          <span className="text-sm text-muted-foreground">{label}</span>
        ) : (
          <span className="sr-only">{srLabel}</span>
        )}
      </span>
    );
  },
);

Spinner.displayName = "Spinner";

export { Spinner };
