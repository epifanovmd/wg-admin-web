import { CalendarLayout } from "./CalendarLayout";
import { useCalendarNavigation, useSingleCalendarDays } from "./hooks";
import type { CalendarLocaleProps, DateBoundsProps } from "./types";
import { DATE_LOCALE, resolveWeekStartsOn } from "./utils";

export interface CalendarProps extends CalendarLocaleProps, DateBoundsProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  onDateHover?: (date: Date | undefined) => void;
  /** Стартовый месяц/год (по умолчанию — месяц `selected` или текущий). */
  defaultMonth?: number;
  defaultYear?: number;
  className?: string;
}

export const Calendar = ({
  selected,
  onSelect,
  onDateHover,
  defaultMonth,
  defaultYear,
  className,
  locale = DATE_LOCALE,
  weekStartsOn: weekStartsOnProp,
  minDate,
  maxDate,
  disableDate,
}: CalendarProps) => {
  const weekStartsOn = resolveWeekStartsOn(locale, weekStartsOnProp);

  const nav = useCalendarNavigation({
    locale,
    defaultMonth: defaultMonth ?? selected?.getMonth(),
    defaultYear: defaultYear ?? selected?.getFullYear(),
    minDate,
    maxDate,
  });

  const days = useSingleCalendarDays({
    selected,
    onSelect,
    minDate,
    maxDate,
    disableDate,
  });

  return (
    <CalendarLayout
      nav={nav}
      locale={locale}
      weekStartsOn={weekStartsOn}
      selected={selected}
      className={className}
      getDayFlags={days.getDayFlags}
      isDayDisabled={days.isDisabled}
      onDaySelect={days.handleDaySelect}
      onDateHover={onDateHover}
    />
  );
};
