import { cn } from "@shared/lib/utils";
import { Clock } from "lucide-react";
import * as React from "react";

import { timeMask, useMaskedInput } from "../masked-input";
import type { PopoverContentProps } from "../popover";
import {
  type DatePickerTriggerVariantProps,
  MaskedPickerField,
  TimeList,
} from "./components";
import { usePickerPopover } from "./hooks";
import type { PickerFieldProps } from "./types";
import {
  applyTime,
  buildTimeOptions,
  DEFAULT_TIME_STEP,
  formatTime,
  parseTime,
  type TimeParts,
} from "./utils";

export interface TimePickerProps
  extends
    Omit<
      PickerFieldProps<HTMLInputElement>,
      | "dateFormat"
      | "locale"
      | "weekStartsOn"
      | "minDate"
      | "maxDate"
      | "disableDate"
    >,
    DatePickerTriggerVariantProps {
  /**
   * Дата, у которой выбирается время: день сохраняется, меняются только часы
   * и минуты (секунды обнуляются). Тот же тип, что у DatePicker, — поля даты
   * и времени можно связать одним значением.
   */
  value?: Date;
  /** Вызывается с полным корректным временем или `undefined` (очистка). */
  onChange?: (date: Date | undefined) => void;
  /** Шаг списка времени, минут (по умолчанию 30). */
  step?: number;
  /** День, к которому применяется время, пока `value` пуст (по умолчанию — сегодня). */
  referenceDate?: Date;
  /** Открывать список при фокусе инпута. */
  openOnFocus?: boolean;
  contentProps?: Partial<PopoverContentProps>;
}

const CLOCK_ICON = <Clock aria-hidden className="h-4 w-4" />;
/** Список по ширине поля, как у Select. */
const CONTENT_WIDTH_CLASS = "w-[var(--radix-popover-trigger-width)]";
const LIST_WIDTH_CLASS = "w-full";
const OPTION_FOCUS_SELECTOR = '[role="option"][tabindex="0"]';

/**
 * Время в 24-часовом формате: ввод по маске «чч:мм» и список с шагом
 * `step`. Незавершённый ввод не меняет значение и откатывается при потере
 * фокуса.
 */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  (
    {
      value,
      onChange,
      step = DEFAULT_TIME_STEP,
      referenceDate,
      placeholder = "чч:мм",
      open: openProp,
      onOpenChange,
      onBlur,
      contentProps,
      ...fieldProps
    },
    ref,
  ) => {
    const popover = usePickerPopover({ open: openProp, onOpenChange });
    const displayValue = formatTime(value);
    const options = React.useMemo(() => buildTimeOptions(step), [step]);

    const emitTime = (time: TimeParts) =>
      onChange?.(applyTime(value ?? referenceDate ?? new Date(), time));

    const masked = useMaskedInput({
      mask: timeMask,
      value: displayValue,
      onChange: ({ value: text, isComplete }) => {
        if (text === "") {
          onChange?.(undefined);

          return;
        }

        const time = isComplete ? parseTime(text) : undefined;

        if (time) emitTime(time);
      },
    });

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (!masked.isComplete) masked.setValue(displayValue);
      onBlur?.(event);
    };

    const listContentProps = {
      ...contentProps,
      className: cn(CONTENT_WIDTH_CLASS, contentProps?.className),
    };

    const handleSelect = (text: string) => {
      const time = parseTime(text);

      if (time) emitTime(time);
      popover.close();
    };

    return (
      <MaskedPickerField
        {...fieldProps}
        inputRef={masked.ref}
        forwardedRef={ref}
        defaultValue={displayValue}
        hasValue={masked.value.length > 0}
        placeholder={placeholder}
        onClear={masked.clear}
        onBlur={handleBlur}
        open={popover.open}
        onOpenChange={popover.setOpen}
        triggerIcon={CLOCK_ICON}
        triggerLabel="Открыть список времени"
        focusSelector={OPTION_FOCUS_SELECTOR}
        popupType="listbox"
        inputMode="numeric"
        contentProps={listContentProps}
      >
        <TimeList
          options={options}
          selected={displayValue}
          onSelect={handleSelect}
          className={LIST_WIDTH_CLASS}
        />
      </MaskedPickerField>
    );
  },
);

TimePicker.displayName = "TimePicker";
