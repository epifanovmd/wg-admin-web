import { cn } from "@shared/lib/utils";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { emptyVariants } from "./empty-variants";
import { EmptyIcon, type EmptyIconName } from "./EmptyIcon";

export interface EmptyProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof emptyVariants> {
  icon?: EmptyIconName | React.ReactElement;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  (
    {
      className,
      size,
      icon = "inbox",
      title = "Нет данных",
      description,
      action,
      children,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(emptyVariants({ size }), className)}
      {...props}
    >
      <EmptyIcon icon={icon} size={size} />
      <div className="flex flex-col items-center gap-1">
        {title && <p className="font-medium text-foreground">{title}</p>}
        {description && (
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
      {children}
    </div>
  ),
);

Empty.displayName = "Empty";

export { Empty };
