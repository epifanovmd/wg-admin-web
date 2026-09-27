import { format, startOfDay } from "date-fns";
import * as React from "react";

import { createDateMask, useMaskedInput } from "../masked-input";
import type { PopoverContentProps } from "../popover";
import { Calendar, type CalendarProps } from "./Calendar";
import {
  CalendarTimeField,
  type DatePickerTriggerVariantProps,
  MaskedPickerField,
} from "./components";
import { usePickerPopover } from "./hooks";
import type { PickerFieldProps, PickerTimeProps } from "./types";
import {
  applyTime,
  createDateTimeMask,
  DATE_LOCALE,
  isDayDisabled,
  mergeDateAndTime,
  type TimeParts,
} from "./utils";

export interface MaskedDatePickerProps
  extends
    PickerFieldProps<HTMLInputElement>,
    PickerTimeProps,
    DatePickerTriggerVariantProps {
  value?: Date;
  /** Вызывается только с полной корректной датой или `undefined` (очистка). */
  onChange?: (date: Date | undefined) => void;
  /** Открывать календарь при фокусе инпута. */
  openOnFocus?: boolean;
  contentProps?: Partial<PopoverContentProps>;
  calendarProps?: Omit<CalendarProps, "selected" | "onSelect">;
}

const DATE_FORMAT = "dd.MM.yyyy";
const DATE_TIME_FORMAT = "dd.MM.yyyy HH:mm";

/**
 * Дата с ручным вводом по маске и календарём. Незавершённый или
 * недопустимый ввод не меняет значение и откатывается при потере фокуса.
 * С `withTime` маска и формат включают время (`dd.MM.yyyy HH:mm`), под
 * календарём появляется поле времени.
 */
export const MaskedDatePicker = React.forwardRef<
  HTMLInputElement,
  MaskedDatePickerProps
>(
  (
    {
      value,
      onChange,
      withTime = false,
      timeStep,
      placeholder = withTime ? "дд.мм.гггг чч:мм" : "дд.мм.гггг",
      dateFormat = withTime ? DATE_TIME_FORMAT : DATE_FORMAT,
      open: openProp,
      onOpenChange,
      locale = DATE_LOCALE,
      weekStartsOn,
      minDate,
      maxDate,
      disableDate,
      calendarProps,
      onBlur,
      ...fieldProps
    },
    ref,
  ) => {
    const popover = usePickerPopover({ open: openProp, onOpenChange });
    const rejectedRef = React.useRef(false);

    const displayValue = value ? format(value, dateFormat) : "";

    const mask = React.useMemo(
      () =>
        withTime
          ? createDateTimeMask({ dateFormat, min: minDate, max: maxDate })
          : createDateMask({ dateFormat, min: minDate, max: maxDate }),
      [dateFormat, minDate, maxDate, withTime],
    );

    const masked = useMaskedInput({
      mask,
      value: displayValue,
      onChange: ({ value: text, typedValue, isComplete }) => {
        rejectedRef.current = false;

        if (text === "") {
          onChange?.(undefined);

          return;
        }

        if (!isComplete) return;

        const date = typedValue as Date;

        if (isDayDisabled(date, { minDate, maxDate, disableDate })) {
          rejectedRef.current = true;

          return;
        }

        onChange?.(date);
      },
    });

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      if (!masked.isComplete || rejectedRef.current) {
        rejectedRef.current = false;
        masked.setValue(displayValue);
      }
      onBlur?.(event);
    };

    const handleSelect = React.useCallback(
      (date: Date) => {
        if (withTime) {
          onChange?.(mergeDateAndTime(date, value));

          return;
        }

        onChange?.(date);
        popover.close();
      },
      [onChange, popover, value, withTime],
    );

    const handleTimeChange = (time: TimeParts) =>
      onChange?.(applyTime(value ?? startOfDay(new Date()), time));

    const previewPlaceholder =
      popover.open && popover.hoverDate
        ? format(mergeDateAndTime(popover.hoverDate, value), dateFormat)
        : placeholder;

    return (
      <MaskedPickerField
        {...fieldProps}
        inputRef={masked.ref}
        forwardedRef={ref}
        defaultValue={displayValue}
        hasValue={masked.value.length > 0}
        placeholder={previewPlaceholder}
        onClear={masked.clear}
        onBlur={handleBlur}
        open={popover.open}
        onOpenChange={popover.setOpen}
      >
        <Calendar
          selected={value}
          onSelect={handleSelect}
          onDateHover={popover.handleDateHover}
          locale={locale}
          weekStartsOn={weekStartsOn}
          minDate={minDate}
          maxDate={maxDate}
          disableDate={disableDate}
          {...calendarProps}
        />
        {withTime && (
          <CalendarTimeField
            value={value}
            step={timeStep}
            onTimeChange={handleTimeChange}
          />
        )}
      </MaskedPickerField>
    );
  },
);

MaskedDatePicker.displayName = "MaskedDatePicker";
