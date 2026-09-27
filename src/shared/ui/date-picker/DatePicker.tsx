import { format, startOfDay } from "date-fns";
import * as React from "react";

import { Popover, type PopoverContentProps } from "../popover";
import { Calendar, type CalendarProps } from "./Calendar";
import {
  CalendarTimeField,
  DatePickerTrigger,
  type DatePickerTriggerVariantProps,
} from "./components";
import { usePickerPopover } from "./hooks";
import type { PickerFieldProps, PickerTimeProps } from "./types";
import {
  applyTime,
  DATE_LOCALE,
  mergeDateAndTime,
  normalizeDateTimeValue,
  normalizeDateValue,
  type TimeParts,
} from "./utils";

export interface DatePickerProps
  extends
    PickerFieldProps<HTMLButtonElement>,
    PickerTimeProps,
    DatePickerTriggerVariantProps {
  /** Дата или ISO-строка; без `withTime` время отбрасывается. */
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  contentProps?: Partial<PopoverContentProps>;
  calendarProps?: Omit<CalendarProps, "selected" | "onSelect">;
}

const DATE_FORMAT = "d MMMM yyyy";
const DATE_TIME_FORMAT = "d MMMM yyyy, HH:mm";

/**
 * Пикер даты с кнопкой-триггером; hover по календарю превьюит дату.
 * С `withTime` под календарём появляется поле времени: выбор дня сохраняет
 * время, смена времени — день, попап не закрывается после выбора дня.
 */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value: rawValue,
      onChange,
      withTime = false,
      timeStep,
      placeholder = withTime ? "Выберите дату и время" : "Выберите дату",
      disabled,
      className,
      dateFormat = withTime ? DATE_TIME_FORMAT : DATE_FORMAT,
      clearable = false,
      open: openProp,
      onOpenChange,
      locale = DATE_LOCALE,
      weekStartsOn,
      minDate,
      maxDate,
      disableDate,
      size,
      variant,
      contentProps,
      calendarProps,
      ...triggerProps
    },
    ref,
  ) => {
    const value = withTime
      ? normalizeDateTimeValue(rawValue)
      : normalizeDateValue(rawValue);
    const popover = usePickerPopover({ open: openProp, onOpenChange });

    const hoverDate =
      withTime && popover.hoverDate
        ? mergeDateAndTime(popover.hoverDate, value)
        : popover.hoverDate;
    const shownDate = value ?? hoverDate;
    const displayText = shownDate
      ? format(shownDate, dateFormat, { locale })
      : placeholder;

    const showClear = clearable && !disabled && value !== undefined;

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

    const handleClear = React.useCallback(
      () => onChange?.(undefined),
      [onChange],
    );

    return (
      <Popover open={popover.open} onOpenChange={popover.setOpen}>
        <DatePickerTrigger
          ref={ref}
          {...triggerProps}
          size={size}
          variant={variant}
          disabled={disabled}
          className={className}
          open={popover.open}
          muted={value === undefined}
          showClear={showClear}
          onClear={handleClear}
        >
          {displayText}
        </DatePickerTrigger>

        <Popover.Content size="none" align="start" {...contentProps}>
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
        </Popover.Content>
      </Popover>
    );
  },
);

DatePicker.displayName = "DatePicker";
