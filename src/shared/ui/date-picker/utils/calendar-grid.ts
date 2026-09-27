import { getDay, getDaysInMonth, startOfMonth } from "date-fns";

import type { WeekStartsOn } from "../types";

/**
 * Ячейки сетки месяца по неделям: `null` — пустая ячейка до/после месяца.
 * Длина кратна 7.
 */
export const buildCalendarCells = (
  viewDate: Date,
  weekStartsOn: WeekStartsOn,
): (Date | null)[] => {
  const monthStart = startOfMonth(viewDate);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const daysInMonth = getDaysInMonth(monthStart);
  const offset = (getDay(monthStart) - weekStartsOn + 7) % 7;
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const day = index - offset + 1;

    return day >= 1 && day <= daysInMonth ? new Date(year, month, day) : null;
  });
};
