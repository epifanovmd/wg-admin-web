import { cn } from "@shared/lib/utils";
import * as React from "react";

import { Card, CardContent, type CardProps } from "../card";
import { INTENT_SOFT } from "../foundation";

export type StatCardVariant =
  "default" | "success" | "warning" | "destructive" | "info" | "purple";

const ICON_CLASSES: Record<StatCardVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: INTENT_SOFT.success,
  warning: INTENT_SOFT.warning,
  destructive: INTENT_SOFT.destructive,
  info: INTENT_SOFT.info,
  purple: INTENT_SOFT.purple,
};

export interface StatCardProps extends Omit<
  CardProps,
  "title" | "description" | "variant" | "children"
> {
  title: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Смысловая окраска значка. */
  variant?: StatCardVariant;
}

// Значок — в строке заголовка: значению остаётся вся ширина карточки, и в
// узкой сетке оно переносится, а не обрезается многоточием.
const CONTENT_CLASS = "flex flex-col gap-1.5 p-3 sm:p-4";
const HEADER_CLASS = "flex items-center justify-between gap-2";
const TITLE_CLASS =
  "min-w-0 truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const VALUE_CLASS =
  "break-words text-lg font-bold leading-tight tabular-nums text-foreground sm:text-xl";
const DESCRIPTION_CLASS = "text-xs text-muted-foreground";
const ICON_BOX_CLASS =
  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md [&_svg]:h-4 [&_svg]:w-4";

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      description,
      icon,
      variant = "default",
      contentClassName,
      ...props
    },
    ref,
  ) => (
    <Card ref={ref} {...props}>
      <CardContent className={cn(CONTENT_CLASS, contentClassName)}>
        <div className={HEADER_CLASS}>
          <p className={TITLE_CLASS}>{title}</p>
          {icon && (
            <div
              aria-hidden
              className={cn(ICON_BOX_CLASS, ICON_CLASSES[variant])}
            >
              {icon}
            </div>
          )}
        </div>
        <div className={VALUE_CLASS}>{value}</div>
        {description && <p className={DESCRIPTION_CLASS}>{description}</p>}
      </CardContent>
    </Card>
  ),
);

StatCard.displayName = "StatCard";

export { StatCard };
