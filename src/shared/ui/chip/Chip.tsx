import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";

import { INHERIT_FONT_CLASS } from "../foundation";
import { chipVariants } from "./chip-variants";

export interface ChipProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick">,
    Omit<VariantProps<typeof chipVariants>, "disabled"> {
  /** Делает подпись чипа кнопкой. */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Добавляет кнопку удаления. */
  onRemove?: () => void;
  /** Доступное имя кнопки удаления. */
  removeLabel?: string;
  leftIcon?: React.ReactNode;
  avatar?: React.ReactNode;
  disabled?: boolean;
}

const ACTION_CLASS = `${INHERIT_FONT_CLASS} inline-flex items-center gap-1.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none`;
const LABEL_CLASS = "inline-flex min-w-0 items-center gap-1.5";
const REMOVE_CLASS =
  "-mr-1 ml-0.5 inline-flex cursor-pointer rounded-full transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none";

const Chip = React.forwardRef<HTMLSpanElement, ChipProps>(
  (
    {
      className,
      variant,
      active,
      size,
      disabled = false,
      onClick,
      onRemove,
      removeLabel = "Удалить",
      leftIcon,
      avatar,
      children,
      ...props
    },
    ref,
  ) => {
    const inner = (
      <>
        {avatar && <span className="-ml-1 inline-flex">{avatar}</span>}
        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
        <span className="truncate">{children}</span>
      </>
    );

    const label = onClick ? (
      <button
        type="button"
        className={cn(ACTION_CLASS, "cursor-pointer")}
        onClick={onClick}
        disabled={disabled}
      >
        {inner}
      </button>
    ) : (
      <span className={LABEL_CLASS}>{inner}</span>
    );

    return (
      <span
        ref={ref}
        className={cn(
          chipVariants({ variant, active, size, disabled }),
          className,
        )}
        aria-disabled={disabled || undefined}
        {...props}
      >
        {label}
        {onRemove && (
          <button
            type="button"
            aria-label={removeLabel}
            className={REMOVE_CLASS}
            onClick={onRemove}
            disabled={disabled}
          >
            <X aria-hidden className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    );
  },
);

Chip.displayName = "Chip";

export { Chip };
