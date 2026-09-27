import * as React from "react";

import {
  createDateRangeMask,
  formatDateRangeValue,
  parseDateRangeValue,
  useMaskedInput,
} from "../masked-input";
import type { PopoverContentProps } from "../popover";
import {
  type DatePickerTriggerVariantProps,
  MaskedPickerField,
} from "./components";
import { usePickerPopover } from "./hooks";
import { RangeCalendar, type RangeCalendarProps } from "./RangeCalendar";
import type { DateRange, PickerFieldProps } from "./types";
import { DATE_LOCALE, getPreviewRange, isDayDisabled } from "./utils";

export interface MaskedDateRangePickerProps
  extends PickerFieldProps<HTMLInputElement>, DatePickerTriggerVariantProps {
  value?: DateRange;
  /** Вызывается только с полным корректным периодом или `undefined`. */
  onChange?: (range: DateRange | undefined) => void;
  openOnFocus?: boolean;
  contentProps?: Partial<PopoverContentProps>;
  calendarProps?: Omit<
    RangeCalendarProps,
    "selected" | "onSelect" | "hoverDate" | "onDateHover"
  >;
}

const isComplete = (range: DateRange | undefined) =>
  Boolean(range?.from && range.to);

/**
 * Период с ручным вводом по маске и календарём. Превью при наведении
 * показывается только в placeholder: набранный текст не перетирается.
 */
export const MaskedDateRangePicker = React.forwardRef<
  HTMLInputElement,
  MaskedDateRangePickerProps
>(
  (
    {
      value,
      onChange,
      placeholder = "дд.мм.гггг — дд.мм.гггг",
      dateFormat = "dd.MM.yyyy",
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

    const displayValue = formatDateRangeValue(value, { dateFormat });

    const mask = React.useMemo(
      () => createDateRangeMask({ dateFormat, min: minDate, max: maxDate }),
      [dateFormat, minDate, maxDate],
    );

    const isRangeDisabled = (range: DateRange) =>
      [range.from, range.to].some(
        date => date && isDayDisabled(date, { minDate, maxDate, disableDate }),
      );

    const masked = useMaskedInput({
      mask,
      value: displayValue,
      onChange: ({ value: text, isComplete: textComplete }) => {
        rejectedRef.current = false;

        if (text === "") {
          onChange?.(undefined);

          return;
        }

        if (!textComplete) return;

        const range = parseDateRangeValue(text, { dateFormat });

        if (!isComplete(range) || isRangeDisabled(range)) {
          rejectedRef.current = true;

          return;
        }

        onChange?.(range);
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
      (range: DateRange | undefined) => {
        onChange?.(range);
        if (isComplete(range)) popover.close();
      },
      [onChange, popover],
    );

    const previewRange = getPreviewRange(value, popover.hoverDate);
    const previewPlaceholder = previewRange
      ? formatDateRangeValue(previewRange, { dateFormat })
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
      </MaskedPickerField>
    );
  },
);

MaskedDateRangePicker.displayName = "MaskedDateRangePicker";
