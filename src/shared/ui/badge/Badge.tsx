import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { badgeVariants } from "./badge-variants";

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Точка-индикатор перед контентом. */
  dot?: boolean;
  /** Число больше `max` показывается как `${max}+`. */
  max?: number;
}

const formatContent = (
  children: React.ReactNode,
  max?: number,
): React.ReactNode =>
  max != null && typeof children === "number" && children > max
    ? `${max}+`
    : children;

const isTextContent = (children: React.ReactNode): boolean =>
  typeof children === "string" || typeof children === "number";

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, dot, max, children, ...props }, ref) => {
    const content = formatContent(children, max);

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      >
        {dot && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" />
        )}
        {/* Текст обрезается, разметка с иконками рендерится как есть —
            иначе иконка и подпись попадают в один truncate-span и съезжают. */}
        {isTextContent(children) ? (
          <span className="min-w-0 truncate">{content}</span>
        ) : (
          content
        )}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export { Badge };
