import type { Locale } from "date-fns";
import {
  addMonths,
  addYears,
  endOfMonth,
  endOfYear,
  format,
  isAfter,
  isBefore,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { useCallback, useMemo, useState } from "react";

import type { ViewMode } from "../types";
import { getYearPageStart, YEARS_PER_PAGE } from "../utils";

const NEXT_MODE: Record<ViewMode, ViewMode> = {
  day: "month",
  month: "year",
  year: "year",
};

export interface UseCalendarNavigationOptions {
  locale: Locale;
  /** Стартовый месяц/год (uncontrolled): обычно из выбранной даты. */
  defaultMonth?: number;
  defaultYear?: number;
  minDate?: Date;
  maxDate?: Date;
}

export interface UseCalendarNavigationResult {
  viewMode: ViewMode;
  /** Первое число просматриваемого месяца. */
  viewDate: Date;
  currentMonth: number;
  currentYear: number;
  headerText: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  handlePrevious: () => void;
  handleNext: () => void;
  handleHeaderClick: () => void;
  handleMonthSelect: (month: number) => void;
  handleYearSelect: (year: number) => void;
  /** Показать месяц, содержащий дату (клавиатурная навигация по дням). */
  showDate: (date: Date) => void;
}

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

const resolveInitialViewDate = (month?: number, year?: number): Date => {
  const now = new Date();

  return new Date(year ?? now.getFullYear(), month ?? now.getMonth(), 1);
};

export const useCalendarNavigation = ({
  locale,
  defaultMonth,
  defaultYear,
  minDate,
  maxDate,
}: UseCalendarNavigationOptions): UseCalendarNavigationResult => {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [viewDate, setViewDate] = useState(() =>
    resolveInitialViewDate(defaultMonth, defaultYear),
  );

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  /** Шаг стрелок в текущем режиме: месяц, год или страница лет. */
  const step = useCallback(
    (date: Date, direction: 1 | -1): Date => {
      switch (viewMode) {
        case "day":
          return addMonths(date, direction);
        case "month":
          return addYears(date, direction);
        case "year":
          return addYears(date, direction * YEARS_PER_PAGE);
      }
    },
    [viewMode],
  );

  /** Границы видимой области после шага, чтобы не уйти за min/max. */
  const rangeOfView = useCallback(
    (date: Date): [Date, Date] => {
      switch (viewMode) {
        case "day":
          return [startOfMonth(date), endOfMonth(date)];
        case "month":
          return [startOfYear(date), endOfYear(date)];
        case "year": {
          const start = getYearPageStart(date.getFullYear());

          return [
            new Date(start, 0, 1),
            endOfYear(new Date(start + YEARS_PER_PAGE - 1, 0, 1)),
          ];
        }
      }
    },
    [viewMode],
  );

  const canGoPrevious = useMemo(() => {
    if (!minDate) return true;
    const [, end] = rangeOfView(step(viewDate, -1));

    return !isBefore(end, startOfDay(minDate));
  }, [minDate, rangeOfView, step, viewDate]);

  const canGoNext = useMemo(() => {
    if (!maxDate) return true;
    const [start] = rangeOfView(step(viewDate, 1));

    return !isAfter(start, startOfDay(maxDate));
  }, [maxDate, rangeOfView, step, viewDate]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) setViewDate(date => step(date, -1));
  }, [canGoPrevious, step]);

  const handleNext = useCallback(() => {
    if (canGoNext) setViewDate(date => step(date, 1));
  }, [canGoNext, step]);

  const handleHeaderClick = useCallback(() => {
    setViewMode(mode => NEXT_MODE[mode]);
  }, []);

  const handleMonthSelect = useCallback((month: number) => {
    setViewDate(date => new Date(date.getFullYear(), month, 1));
    setViewMode("day");
  }, []);

  const handleYearSelect = useCallback((year: number) => {
    setViewDate(date => new Date(year, date.getMonth(), 1));
    setViewMode("month");
  }, []);

  const showDate = useCallback((date: Date) => {
    setViewDate(startOfMonth(date));
  }, []);

  const headerText = useMemo(() => {
    switch (viewMode) {
      case "day":
        return capitalize(format(viewDate, "LLLL yyyy", { locale }));
      case "month":
        return String(currentYear);
      case "year": {
        const start = getYearPageStart(currentYear);

        return `${start} — ${start + YEARS_PER_PAGE - 1}`;
      }
    }
  }, [viewMode, viewDate, currentYear, locale]);

  return {
    viewMode,
    viewDate,
    currentMonth,
    currentYear,
    headerText,
    canGoPrevious,
    canGoNext,
    handlePrevious,
    handleNext,
    handleHeaderClick,
    handleMonthSelect,
    handleYearSelect,
    showDate,
  };
};
