import { cn } from "@shared/lib/utils";
import type { Locale } from "date-fns";

import {
  CalendarDayView,
  CalendarHeader,
  CalendarMonthView,
  CalendarYearView,
} from "./components";
import type { UseCalendarNavigationResult } from "./hooks";
import type { DayFlags, WeekStartsOn } from "./types";

export interface CalendarLayoutProps {
  nav: UseCalendarNavigationResult;
  locale: Locale;
  weekStartsOn: WeekStartsOn;
  /** Выбранная дата: подсветка месяца/года и стартовый Tab-фокус в сетке. */
  selected?: Date;
  className?: string;
  getDayFlags: (date: Date) => DayFlags;
  isDayDisabled: (date: Date) => boolean;
  onDaySelect: (date: Date) => void;
  onDateHover?: (date: Date | undefined) => void;
}

/** Общая раскладка календарей: заголовок + вид дней / месяцев / лет. */
export const CalendarLayout = ({
  nav,
  locale,
  weekStartsOn,
  selected,
  className,
  getDayFlags,
  isDayDisabled,
  onDaySelect,
  onDateHover,
}: CalendarLayoutProps) => {
  const selectedInViewYear =
    selected && selected.getFullYear() === nav.currentYear
      ? selected
      : undefined;

  const renderView = () => {
    switch (nav.viewMode) {
      case "day":
        return (
          <CalendarDayView
            viewDate={nav.viewDate}
            locale={locale}
            weekStartsOn={weekStartsOn}
            preferredDate={selected}
            getDayFlags={getDayFlags}
            isDayDisabled={isDayDisabled}
            onDaySelect={onDaySelect}
            onDateHover={onDateHover}
            onViewDateChange={nav.showDate}
          />
        );
      case "month":
        return (
          <CalendarMonthView
            locale={locale}
            selectedMonth={selectedInViewYear?.getMonth()}
            onMonthSelect={nav.handleMonthSelect}
          />
        );
      case "year":
        return (
          <CalendarYearView
            currentYear={nav.currentYear}
            selectedYear={selected?.getFullYear()}
            onYearSelect={nav.handleYearSelect}
          />
        );
    }
  };

  return (
    <div className={cn("w-[280px]", className)}>
      <CalendarHeader
        headerText={nav.headerText}
        viewMode={nav.viewMode}
        canGoPrevious={nav.canGoPrevious}
        canGoNext={nav.canGoNext}
        onPrevious={nav.handlePrevious}
        onNext={nav.handleNext}
        onHeaderClick={nav.handleHeaderClick}
      />
      {renderView()}
    </div>
  );
};
