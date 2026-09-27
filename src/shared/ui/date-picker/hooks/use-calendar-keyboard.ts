import { useLatestRef } from "@shared/lib/hooks";
import {
  addDays,
  addMonths,
  endOfWeek,
  isSameMonth,
  startOfWeek,
} from "date-fns";
import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { WeekStartsOn } from "../types";

export interface UseCalendarKeyboardOptions {
  /** Первое число просматриваемого месяца. */
  viewDate: Date;
  weekStartsOn: WeekStartsOn;
  /** Дата, которая получает `tabIndex=0` по умолчанию (выбранная/сегодня). */
  preferredDate?: Date;
  isDisabled: (date: Date) => boolean;
  onSelect: (date: Date) => void;
  /** Курсор ушёл в другой месяц — показать его. */
  onViewDateChange: (date: Date) => void;
}

export interface UseCalendarKeyboardResult {
  /** Единственная ячейка с `tabIndex=0` (roving tabindex). */
  focusedDate: Date;
  gridRef: React.RefObject<HTMLDivElement | null>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Фокус ячейки указателем/Tab — синхронизировать курсор. */
  handleCellFocus: (date: Date) => void;
}

const DATE_ATTR = "data-date";

/** Ключ ячейки для `data-date` (локальная дата без времени). */
export const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const resolveDefaultFocus = (viewDate: Date, preferredDate?: Date): Date => {
  if (preferredDate && isSameMonth(preferredDate, viewDate)) {
    return preferredDate;
  }
  const today = new Date();

  return isSameMonth(today, viewDate) ? today : viewDate;
};

const moveByKey = (
  key: string,
  date: Date,
  weekStartsOn: WeekStartsOn,
): Date | undefined => {
  switch (key) {
    case "ArrowLeft":
      return addDays(date, -1);
    case "ArrowRight":
      return addDays(date, 1);
    case "ArrowUp":
      return addDays(date, -7);
    case "ArrowDown":
      return addDays(date, 7);
    case "Home":
      return startOfWeek(date, { weekStartsOn });
    case "End":
      return endOfWeek(date, { weekStartsOn });
    case "PageUp":
      return addMonths(date, -1);
    case "PageDown":
      return addMonths(date, 1);
    default:
      return undefined;
  }
};

/** Стрелочная навигация по сетке дней (WAI-ARIA grid, roving tabindex). */
export const useCalendarKeyboard = ({
  viewDate,
  weekStartsOn,
  preferredDate,
  isDisabled,
  onSelect,
  onViewDateChange,
}: UseCalendarKeyboardOptions): UseCalendarKeyboardResult => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState<Date | undefined>();
  const focusPendingRef = useRef(false);
  const latest = useLatestRef({ isDisabled, onSelect, onViewDateChange });

  const focusedDate =
    cursor && isSameMonth(cursor, viewDate)
      ? cursor
      : resolveDefaultFocus(viewDate, preferredDate);

  const handleCellFocus = useCallback((date: Date) => {
    focusPendingRef.current = false;
    setCursor(date);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!latest.current.isDisabled(focusedDate)) {
          latest.current.onSelect(focusedDate);
        }

        return;
      }

      const next = moveByKey(e.key, focusedDate, weekStartsOn);

      if (!next) return;
      e.preventDefault();
      focusPendingRef.current = true;
      setCursor(next);
      if (!isSameMonth(next, viewDate)) latest.current.onViewDateChange(next);
    },
    [focusedDate, weekStartsOn, viewDate, latest],
  );

  useEffect(() => {
    if (!focusPendingRef.current) return;
    focusPendingRef.current = false;

    gridRef.current
      ?.querySelector<HTMLElement>(`[${DATE_ATTR}="${toDateKey(focusedDate)}"]`)
      ?.focus();
  }, [focusedDate]);

  return { focusedDate, gridRef, handleKeyDown, handleCellFocus };
};
