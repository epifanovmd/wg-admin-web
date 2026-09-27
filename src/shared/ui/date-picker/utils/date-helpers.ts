import type { Locale } from "date-fns";
import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";

import type { DateBoundsProps, DateRange } from "../types";
import { YEARS_PER_PAGE } from "./constants";

/** Начало 12-летней страницы в режиме выбора года. */
export const getYearPageStart = (year: number): number =>
  Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE;

/** Дата вне `[minDate, maxDate]` (сравнение по дням). */
export const isOutOfBounds = (
  date: Date,
  minDate?: Date,
  maxDate?: Date,
): boolean =>
  (!!minDate && isBefore(startOfDay(date), startOfDay(minDate))) ||
  (!!maxDate && isAfter(startOfDay(date), startOfDay(maxDate)));

export const isDayDisabled = (
  date: Date,
  { minDate, maxDate, disableDate }: DateBoundsProps,
): boolean => isOutOfBounds(date, minDate, maxDate) || !!disableDate?.(date);

/**
 * Нормализует входное значение пикера: ISO-строка парсится и приводится к
 * началу дня в локальной зоне — пикер оперирует датой без времени, поэтому
 * `2024-01-15T00:00:00Z` в любой зоне остаётся 15 января.
 */
export const normalizeDateValue = (
  value: Date | string | undefined,
): Date | undefined => {
  if (value == null || value === "") return undefined;

  const parsed = typeof value === "string" ? parseISO(value) : value;

  return Number.isNaN(parsed.getTime()) ? undefined : startOfDay(parsed);
};

/** Как `normalizeDateValue`, но сохраняет время — для пикеров с `withTime`. */
export const normalizeDateTimeValue = (
  value: Date | string | undefined,
): Date | undefined => {
  if (value == null || value === "") return undefined;

  const parsed = typeof value === "string" ? parseISO(value) : value;

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

/**
 * Превью диапазона при наведении: пока выбрана только «от», наведённая
 * дата становится второй границей (в хронологическом порядке).
 */
export const getPreviewRange = (
  value: DateRange | undefined,
  hoverDate: Date | undefined,
): DateRange | undefined => {
  if (!hoverDate || !value?.from || value.to) return undefined;
  if (isSameDay(hoverDate, value.from)) return undefined;

  return isBefore(hoverDate, value.from)
    ? { from: hoverDate, to: value.from }
    : { from: value.from, to: hoverDate };
};

/** Следующая дата диапазона по клику: старт, конец или новый старт. */
export const selectRangeDay = (
  date: Date,
  selected: DateRange | undefined,
): DateRange => {
  if (!selected?.from || selected.to) return { from: date, to: undefined };

  return isBefore(date, selected.from)
    ? { from: date, to: selected.from }
    : { from: selected.from, to: date };
};

/** Подпись диапазона для триггера: «1 янв 2024 — 7 янв 2024». */
export const formatRangeLabel = (
  range: DateRange | undefined,
  dateFormat: string,
  locale: Locale,
  separator = " — ",
): string | undefined => {
  if (!range?.from) return undefined;

  const from = format(range.from, dateFormat, { locale });

  return range.to
    ? `${from}${separator}${format(range.to, dateFormat, { locale })}`
    : from;
};
