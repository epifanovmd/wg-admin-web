import { cn } from "@shared/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { type CollapseSize, useCollapseContext } from "./collapse-context";
import { collapseTriggerVariants } from "./collapse-variants";

export interface CollapseTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  children: React.ReactNode;
  /** Свой индикатор состояния; `false` — без индикатора. */
  icon?: React.ReactNode | false;
  leadingIcon?: React.ReactNode;
}

const CHEVRON_SIZE: Record<CollapseSize, number> = { sm: 14, md: 16, lg: 18 };

const INDICATOR_CLASS = "flex-shrink-0 transition-transform duration-200";

export const CollapseTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapseTriggerProps
>(
  (
    { children, className, icon, leadingIcon, onClick, disabled, ...props },
    ref,
  ) => {
    const {
      isOpen,
      disabled: contextDisabled,
      toggle,
      triggerId,
      contentId,
      variant,
      size,
    } = useCollapseContext();

    const isDisabled = disabled ?? contextDisabled;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) toggle();
    };

    const indicatorClass = cn(INDICATOR_CLASS, isOpen && "rotate-180");

    const defaultIndicator = (
      <ChevronDown
        aria-hidden
        className={cn(indicatorClass, "text-muted-foreground")}
        size={CHEVRON_SIZE[size]}
      />
    );

    const customIndicator = icon ? (
      <span className={indicatorClass}>{icon}</span>
    ) : null;

    const indicatorNode =
      icon === false ? null : (customIndicator ?? defaultIndicator);

    return (
      <button
        ref={ref}
        id={triggerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(collapseTriggerVariants({ variant, size }), className)}
        {...props}
      >
        {leadingIcon && (
          <span className="flex-shrink-0 text-muted-foreground">
            {leadingIcon}
          </span>
        )}
        <span className="flex-1 font-medium">{children}</span>
        {indicatorNode}
      </button>
    );
  },
);

CollapseTrigger.displayName = "Collapse.Trigger";
