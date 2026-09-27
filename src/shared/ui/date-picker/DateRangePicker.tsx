import * as React from "react";

import { Popover, type PopoverContentProps } from "../popover";
import {
  DatePickerTrigger,
  type DatePickerTriggerVariantProps,
  RangePresets,
} from "./components";
import { usePickerPopover } from "./hooks";
import { RangeCalendar, type RangeCalendarProps } from "./RangeCalendar";
import type { DateRange, DateRangePreset, PickerFieldProps } from "./types";
import { DATE_LOCALE, formatRangeLabel, getPreviewRange } from "./utils";

export interface DateRangePickerProps
  extends PickerFieldProps<HTMLButtonElement>, DatePickerTriggerVariantProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  /** Быстрые диапазоны слева от календаря. */
  presets?: DateRangePreset[];
  contentProps?: Partial<PopoverContentProps>;
  calendarProps?: Omit<
    RangeCalendarProps,
    "selected" | "onSelect" | "hoverDate" | "onDateHover"
  >;
}

const isComplete = (range: DateRange | undefined) =>
  Boolean(range?.from && range.to);

/** Пикер периода: попап закрывается, когда выбраны обе границы. */
export const DateRangePicker = React.forwardRef<
  HTMLButtonElement,
  DateRangePickerProps
>(
  (
    {
      value,
      onChange,
      placeholder = "Выберите период",
      disabled,
      className,
      dateFormat = "d MMM yyyy",
      clearable = false,
      open: openProp,
      onOpenChange,
      presets,
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
    const popover = usePickerPopover({ open: openProp, onOpenChange });

    const previewRange = getPreviewRange(value, popover.hoverDate);
    const label = formatRangeLabel(previewRange ?? value, dateFormat, locale);
    const hasValue = value?.from !== undefined;
    const showClear = clearable && !disabled && hasValue;

    const handleSelect = React.useCallback(
      (range: DateRange | undefined) => {
        onChange?.(range);
        if (isComplete(range)) popover.close();
      },
      [onChange, popover],
    );

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
          muted={!hasValue || previewRange !== undefined}
          showClear={showClear}
          onClear={handleClear}
        >
          {label ?? placeholder}
        </DatePickerTrigger>

        <Popover.Content size="none" align="start" {...contentProps}>
          <div className="flex">
            {presets && presets.length > 0 && (
              <RangePresets presets={presets} onSelect={handleSelect} />
            )}
            <RangeCalendar
              selected={value}
              onSelect={handleSelect}
              hoverDate={popover.hoverDate}
              onDateHover={popover.handleDateHover}
              locale={locale}
              weekStartsOn={weekStartsOn}
              minDate={minDate}
              maxDate={maxDate}
              disableDate={disableDate}
              {...calendarProps}
            />
          </div>
        </Popover.Content>
      </Popover>
    );
  },
);

DateRangePicker.displayName = "DateRangePicker";
