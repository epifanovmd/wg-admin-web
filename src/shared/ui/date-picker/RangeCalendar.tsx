import { CalendarLayout } from "./CalendarLayout";
import { useCalendarNavigation, useRangeCalendarDays } from "./hooks";
import type { CalendarLocaleProps, DateBoundsProps, DateRange } from "./types";
import { DATE_LOCALE, resolveWeekStartsOn } from "./utils";

export interface RangeCalendarProps
  extends CalendarLocaleProps, DateBoundsProps {
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  /** Дата под курсором — владелец состояния наведения пикер. */
  hoverDate?: Date;
  onDateHover?: (date: Date | undefined) => void;
  /** Подсвечивать будущий диапазон, пока выбрана только начальная дата. */
  showRangePreview?: boolean;
  /** Стартовый месяц/год (по умолчанию — месяц начала диапазона или текущий). */
  defaultMonth?: number;
  defaultYear?: number;
  className?: string;
}

export const RangeCalendar = ({
  selected,
  onSelect,
  hoverDate,
  onDateHover,
  showRangePreview = true,
  defaultMonth,
  defaultYear,
  className,
  locale = DATE_LOCALE,
  weekStartsOn: weekStartsOnProp,
  minDate,
  maxDate,
  disableDate,
}: RangeCalendarProps) => {
  const weekStartsOn = resolveWeekStartsOn(locale, weekStartsOnProp);

  const nav = useCalendarNavigation({
    locale,
    defaultMonth: defaultMonth ?? selected?.from?.getMonth(),
    defaultYear: defaultYear ?? selected?.from?.getFullYear(),
    minDate,
    maxDate,
  });

  const days = useRangeCalendarDays({
    selected,
    onSelect,
    hoverDate,
    showRangePreview,
    minDate,
    maxDate,
    disableDate,
  });

  return (
    <CalendarLayout
      nav={nav}
      locale={locale}
      weekStartsOn={weekStartsOn}
      selected={selected?.from}
      className={className}
      getDayFlags={days.getDayFlags}
      isDayDisabled={days.isDisabled}
      onDaySelect={days.handleDaySelect}
      onDateHover={onDateHover}
    />
  );
};
