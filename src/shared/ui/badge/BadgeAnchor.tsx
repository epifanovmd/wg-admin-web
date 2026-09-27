import { cn } from "@shared/lib/utils";
import * as React from "react";

import { Badge, type BadgeProps } from "./Badge";
import { badgeVariants } from "./badge-variants";

export type BadgeAnchorPlacement =
  "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface BadgeAnchorProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  content?: React.ReactNode;
  /** Точка вместо контента: только факт события, без числа. */
  dot?: boolean;
  variant?: BadgeProps["variant"];
  max?: number;
  showZero?: boolean;
  placement?: BadgeAnchorPlacement;
  /** Текст для скринридера у точки — у неё нет видимого контента. */
  label?: string;
  children: React.ReactNode;
}

const PLACEMENT_CLASSES: Record<BadgeAnchorPlacement, string> = {
  "top-right": "top-0 right-0 -translate-y-1/2 translate-x-1/2",
  "top-left": "top-0 left-0 -translate-y-1/2 -translate-x-1/2",
  "bottom-right": "bottom-0 right-0 translate-y-1/2 translate-x-1/2",
  "bottom-left": "bottom-0 left-0 translate-y-1/2 -translate-x-1/2",
};

const DOT_CLASS =
  "absolute z-10 h-2.5 w-2.5 min-w-0 rounded-full p-0 ring-2 ring-background";
/** Бейдж шире якоря (иконки) — ограничение ширины снимаем, иначе «99+» режется. */
const BADGE_CLASS = "absolute z-10 max-w-none ring-2 ring-background";

const BadgeAnchor = React.forwardRef<HTMLSpanElement, BadgeAnchorProps>(
  (
    {
      content,
      dot,
      variant,
      max,
      showZero = false,
      placement = "top-right",
      label,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isZero = content === 0;
    const isEmpty = content == null || content === "" || (isZero && !showZero);
    const showBadge = dot || !isEmpty;
    const srLabel = label && <span className="sr-only">{label}</span>;

    let badge: React.ReactNode = null;

    if (showBadge && dot) {
      badge = (
        <span
          className={cn(
            badgeVariants({ variant }),
            DOT_CLASS,
            PLACEMENT_CLASSES[placement],
          )}
        >
          {srLabel}
        </span>
      );
    } else if (showBadge) {
      badge = (
        <Badge
          variant={variant}
          max={max}
          className={cn(BADGE_CLASS, PLACEMENT_CLASSES[placement])}
        >
          {content}
        </Badge>
      );
    }

    return (
      <span
        ref={ref}
        className={cn("relative inline-flex", className)}
        {...props}
      >
        {children}
        {badge}
      </span>
    );
  },
);

BadgeAnchor.displayName = "BadgeAnchor";

export { BadgeAnchor };
