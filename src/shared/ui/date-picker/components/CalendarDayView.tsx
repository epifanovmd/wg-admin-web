import type { Locale } from "date-fns";
import { format } from "date-fns";
import * as React from "react";

import { toDateKey, useCalendarGridCells, useCalendarKeyboard } from "../hooks";
import type { DayFlags, WeekStartsOn } from "../types";
import { FULL_DATE_FORMAT, getWeekdayNames } from "../utils";
import { CalendarDayCell } from "./CalendarDayCell";

export interface CalendarDayViewProps {
  viewDate: Date;
  locale: Locale;
  weekStartsOn: WeekStartsOn;
  /** Дата, получающая Tab-фокус по умолчанию (выбранная). */
  preferredDate?: Date;
  getDayFlags: (date: Date) => DayFlags;
  isDayDisabled: (date: Date) => boolean;
  onDaySelect: (date: Date) => void;
  onDateHover?: (date: Date | undefined) => void;
  onViewDateChange: (date: Date) => void;
}

const WEEKDAY_CLASS =
  "h-9 text-center text-xs font-medium text-muted-foreground flex items-center justify-center";

const chunkWeeks = <T,>(cells: T[]): T[][] =>
  Array.from({ length: cells.length / 7 }, (_, week) =>
    cells.slice(week * 7, week * 7 + 7),
  );

export const CalendarDayView = ({
  viewDate,
  locale,
  weekStartsOn,
  preferredDate,
  getDayFlags,
  isDayDisabled,
  onDaySelect,
  onDateHover,
  onViewDateChange,
}: CalendarDayViewProps) => {
  const cells = useCalendarGridCells({ viewDate, weekStartsOn });
  const weekdays = React.useMemo(
    () => getWeekdayNames(locale, weekStartsOn),
    [locale, weekStartsOn],
  );

  const { focusedDate, gridRef, handleKeyDown, handleCellFocus } =
    useCalendarKeyboard({
      viewDate,
      weekStartsOn,
      preferredDate,
      isDisabled: isDayDisabled,
      onSelect: onDaySelect,
      onViewDateChange,
    });

  const handleHover = React.useCallback(
    (date: Date | undefined) => onDateHover?.(date),
    [onDateHover],
  );

  const handleMouseLeave = () => onDateHover?.(undefined);

  const focusedKey = toDateKey(focusedDate);

  const renderCell = (date: Date | null, index: number) => {
    if (!date)
      return <div key={`empty-${index}`} role="gridcell" aria-hidden />;

    const dateKey = toDateKey(date);

    return (
      <CalendarDayCell
        key={dateKey}
        date={date}
        dateKey={dateKey}
        label={format(date, FULL_DATE_FORMAT, { locale })}
        flags={getDayFlags(date)}
        disabled={isDayDisabled(date)}
        focusable={dateKey === focusedKey}
        onSelect={onDaySelect}
        onHover={handleHover}
        onFocus={handleCellFocus}
      />
    );
  };

  return (
    <div className="p-3">
      <div
        ref={gridRef}
        role="grid"
        aria-label={format(viewDate, "LLLL yyyy", { locale })}
        onKeyDown={handleKeyDown}
        onMouseLeave={handleMouseLeave}
      >
        <div role="row" className="grid grid-cols-7 mb-2">
          {weekdays.map(day => (
            <div key={day} role="columnheader" className={WEEKDAY_CLASS}>
              {day}
            </div>
          ))}
        </div>
        {chunkWeeks(cells).map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="grid grid-cols-7">
            {week.map((date, dayIndex) =>
              renderCell(date, weekIndex * 7 + dayIndex),
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
