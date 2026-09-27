import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { INHERIT_FONT_CLASS } from "../../foundation";

export interface SelectTriggerButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  open: boolean;
  closeOnTriggerClick?: boolean;
}

const BUTTON_CLASS = `${INHERIT_FONT_CLASS} flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 text-left outline-none disabled:cursor-not-allowed`;

/**
 * Кнопка-триггер внутри `SelectTriggerBase` (режим без поиска): нативная
 * активация Enter/Space, `<label htmlFor>` и возврат фокуса при закрытии.
 * Должна рендериться внутри `SelectDropdown` с `triggerMode="anchor"`.
 */
export const SelectTriggerButton = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerButtonProps
>(
  (
    { open, closeOnTriggerClick = true, className, children, ...props },
    ref,
  ) => {
    // preventDefault отменяет встроенный toggle Radix-триггера
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!closeOnTriggerClick && open) e.preventDefault();
    };

    return (
      <PopoverPrimitive.Trigger asChild onClick={handleClick}>
        <button
          ref={ref}
          type="button"
          className={cn(BUTTON_CLASS, className)}
          {...props}
        >
          {children}
        </button>
      </PopoverPrimitive.Trigger>
    );
  },
);

SelectTriggerButton.displayName = "SelectTriggerButton";
