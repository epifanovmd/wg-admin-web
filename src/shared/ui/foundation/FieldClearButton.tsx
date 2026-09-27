import { cn } from "@shared/lib/utils";
import { X } from "lucide-react";
import * as React from "react";

export interface FieldClearButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> {
  onClear: () => void;
}

const preventFocusSteal = (event: React.PointerEvent<HTMLButtonElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

/**
 * Кнопка очистки поля: не забирает фокус у контрола и не всплывает к
 * триггеру, чтобы очистка не открывала попап. Из Tab-порядка исключена —
 * значение можно стереть с клавиатуры и так.
 */
export const FieldClearButton = React.forwardRef<
  HTMLButtonElement,
  FieldClearButtonProps
>(
  (
    { onClear, className, "aria-label": ariaLabel = "Очистить", ...props },
    ref,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onClear();
    };

    return (
      <button
        ref={ref}
        type="button"
        tabIndex={-1}
        aria-label={ariaLabel}
        onPointerDown={preventFocusSteal}
        onClick={handleClick}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
          className,
        )}
        {...props}
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
    );
  },
);

FieldClearButton.displayName = "FieldClearButton";
