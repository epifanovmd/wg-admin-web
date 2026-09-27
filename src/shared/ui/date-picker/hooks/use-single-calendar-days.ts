import { useCallback, useMemo } from "react";

import type { DateBoundsProps, DayFlags } from "../types";
import { classifySingleDay, isDayDisabled } from "../utils";

export interface UseSingleCalendarDaysOptions extends DateBoundsProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
}

export interface UseSingleCalendarDaysResult {
  getDayFlags: (date: Date) => DayFlags;
  isDisabled: (date: Date) => boolean;
  handleDaySelect: (date: Date) => void;
}

/** Модель ячеек для одиночного выбора даты. */
export const useSingleCalendarDays = ({
  selected,
  onSelect,
  minDate,
  maxDate,
  disableDate,
}: UseSingleCalendarDaysOptions): UseSingleCalendarDaysResult => {
  const today = useMemo(() => new Date(), []);

  const isDisabled = useCallback(
    (date: Date) => isDayDisabled(date, { minDate, maxDate, disableDate }),
    [minDate, maxDate, disableDate],
  );

  const handleDaySelect = useCallback(
    (date: Date) => {
      if (!isDisabled(date)) onSelect?.(date);
    },
    [isDisabled, onSelect],
  );

  const getDayFlags = useCallback(
    (date: Date) => classifySingleDay(date, today, selected),
    [today, selected],
  );

  return { getDayFlags, isDisabled, handleDaySelect };
};
