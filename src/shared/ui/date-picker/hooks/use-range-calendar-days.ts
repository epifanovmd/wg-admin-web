import { useCallback, useMemo } from "react";

import type { DateBoundsProps, DateRange, DayFlags } from "../types";
import { classifyRangeDay, isDayDisabled, selectRangeDay } from "../utils";

export interface UseRangeCalendarDaysOptions extends DateBoundsProps {
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  hoverDate?: Date;
  showRangePreview?: boolean;
}

export interface UseRangeCalendarDaysResult {
  getDayFlags: (date: Date) => DayFlags;
  isDisabled: (date: Date) => boolean;
  handleDaySelect: (date: Date) => void;
}

/** Модель ячеек для выбора диапазона: старт → конец, превью по наведению. */
export const useRangeCalendarDays = ({
  selected,
  onSelect,
  hoverDate,
  showRangePreview = true,
  minDate,
  maxDate,
  disableDate,
}: UseRangeCalendarDaysOptions): UseRangeCalendarDaysResult => {
  const today = useMemo(() => new Date(), []);

  const isDisabled = useCallback(
    (date: Date) => isDayDisabled(date, { minDate, maxDate, disableDate }),
    [minDate, maxDate, disableDate],
  );

  const handleDaySelect = useCallback(
    (date: Date) => {
      if (isDisabled(date)) return;
      onSelect?.(selectRangeDay(date, selected));
    },
    [isDisabled, onSelect, selected],
  );

  const getDayFlags = useCallback(
    (date: Date) =>
      classifyRangeDay(date, today, selected, hoverDate, showRangePreview),
    [today, selected, hoverDate, showRangePreview],
  );

  return { getDayFlags, isDisabled, handleDaySelect };
};
