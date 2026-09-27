import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@shared/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import {
  FieldClearButton,
  INHERIT_FONT_CLASS,
  isInvalidVariant,
} from "../../foundation";
import {
  type DatePickerTriggerVariantProps,
  datePickerTriggerVariants,
} from "./date-picker-variants";

export interface DatePickerTriggerProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    DatePickerTriggerVariantProps {
  open?: boolean;
  /** Текст приглушён (placeholder / превью). */
  muted?: boolean;
  showClear?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  /** Класс оболочки поля; `buttonClassName` — самой кнопки. */
  className?: string;
  buttonClassName?: string;
}

const BUTTON_CLASS = `${INHERIT_FONT_CLASS} flex h-full min-w-0 flex-1 cursor-pointer items-center gap-2 text-left outline-none disabled:cursor-not-allowed`;

const DISABLED_CLASS = "pointer-events-none opacity-50";

const noop = () => {};

/**
 * Триггер пикера: оболочка поля (якорь попапа) + кнопка (`Popover.Trigger`)
 * + кнопка очистки соседним элементом. Рендерится внутри `Popover`.
 */
export const DatePickerTrigger = React.forwardRef<
  HTMLButtonElement,
  DatePickerTriggerProps
>(
  (
    {
      open = false,
      muted,
      showClear,
      onClear,
      clearLabel,
      className,
      buttonClassName,
      size,
      variant,
      disabled,
      children,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => (
    <PopoverPrimitive.Anchor asChild>
      <div
        className={cn(
          datePickerTriggerVariants({ size, variant }),
          disabled && DISABLED_CLASS,
          className,
        )}
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            disabled={disabled}
            aria-invalid={
              ariaInvalid ?? (isInvalidVariant(variant) || undefined)
            }
            className={cn(
              BUTTON_CLASS,
              muted && "text-muted-foreground",
              buttonClassName,
            )}
            {...props}
          >
            <CalendarIcon aria-hidden className="h-4 w-4 shrink-0 opacity-50" />
            <span className="flex-1 truncate">{children}</span>
          </button>
        </PopoverPrimitive.Trigger>
        {showClear && (
          <FieldClearButton onClear={onClear ?? noop} aria-label={clearLabel} />
        )}
      </div>
    </PopoverPrimitive.Anchor>
  ),
);

DatePickerTrigger.displayName = "DatePickerTrigger";
