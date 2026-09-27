import { cn } from "@shared/lib/utils";
import * as React from "react";

interface SeparatorBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Декоративный разделитель скрыт от вспомогательных технологий. */
  decorative?: boolean;
}

interface HorizontalSeparatorProps extends SeparatorBaseProps {
  orientation?: "horizontal";
  /** Подпись посередине линии. */
  label?: React.ReactNode;
}

interface VerticalSeparatorProps extends SeparatorBaseProps {
  orientation: "vertical";
  label?: never;
}

export type SeparatorProps = HorizontalSeparatorProps | VerticalSeparatorProps;

const LINE_CLASS: Record<"horizontal" | "vertical", string> = {
  horizontal: "h-px w-full",
  vertical: "h-full w-px self-stretch",
};

const LABELED_CLASS = "flex items-center gap-3 text-xs text-muted-foreground";

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      label,
      ...props
    },
    ref,
  ) => {
    const ariaProps = decorative
      ? { role: "none" }
      : { role: "separator", "aria-orientation": orientation };

    if (label !== undefined) {
      return (
        <div
          ref={ref}
          className={cn(LABELED_CLASS, className)}
          {...ariaProps}
          {...props}
        >
          <span className="h-px flex-1 bg-border" />
          {label}
          <span className="h-px flex-1 bg-border" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("shrink-0 bg-border", LINE_CLASS[orientation], className)}
        {...ariaProps}
        {...props}
      />
    );
  },
);

Separator.displayName = "Separator";

export { Separator };
