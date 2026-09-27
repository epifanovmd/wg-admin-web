import { cn } from "@shared/lib/utils";
import * as React from "react";

import { PAGE_CONTAINER_CLASS } from "../page-layout/page-container";

export type PageHeaderHeading = "h1" | "h2" | "h3";

export interface PageHeaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Синоним `description`, оставлен для совместимости. */
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  /** Уровень заголовка; на странице он один — `h1`. */
  as?: PageHeaderHeading;
}

/**
 * Шапка страницы. Не sticky намеренно: `PageLayout` держит её вне области
 * прокрутки, поэтому она и так всегда видна.
 */
const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      title,
      description,
      subtitle,
      icon,
      actions,
      as: Heading = "h1",
      className,
      ...props
    },
    ref,
  ) => {
    const descriptionNode = description ?? subtitle;

    return (
      <div
        ref={ref}
        className={cn("border-b border-border bg-card", className)}
        {...props}
      >
        <div
          className={cn(
            PAGE_CONTAINER_CLASS,
            "flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4",
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <div
                aria-hidden
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand"
              >
                {icon}
              </div>
            )}
            <div className="flex min-w-0 flex-col">
              <Heading className="truncate text-lg font-bold leading-tight tracking-tight text-foreground">
                {title}
              </Heading>
              {descriptionNode && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {descriptionNode}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex flex-shrink-0 items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  },
);

PageHeader.displayName = "PageHeader";

export { PageHeader };
