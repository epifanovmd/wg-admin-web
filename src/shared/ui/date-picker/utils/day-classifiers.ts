import { isAfter, isBefore, isSameDay, startOfDay } from "date-fns";

import type { DateRange, DayFlags } from "../types";
import { getPreviewRange } from "./date-helpers";

const isStrictlyBetween = (date: Date, from: Date, to: Date): boolean => {
  const day = startOfDay(date);

  return isAfter(day, startOfDay(from)) && isBefore(day, startOfDay(to));
};

const EMPTY_FLAGS: DayFlags = {
  today: false,
  selected: false,
  rangeStart: false,
  rangeEnd: false,
  inRange: false,
  previewStart: false,
  previewEnd: false,
  previewInRange: false,
};

/** Флаги ячейки для одиночного выбора. */
export const classifySingleDay = (
  date: Date,
  today: Date,
  selected: Date | undefined,
): DayFlags => ({
  ...EMPTY_FLAGS,
  today: isSameDay(date, today),
  selected: !!selected && isSameDay(date, selected),
});

/** Флаги ячейки для диапазона (сравнение по дням — время в значении не мешает). */
export const classifyRangeDay = (
  date: Date,
  today: Date,
  selected: DateRange | undefined,
  hoverDate: Date | undefined,
  showPreview: boolean,
): DayFlags => {
  const rangeStart = !!selected?.from && isSameDay(date, selected.from);
  const rangeEnd = !!selected?.to && isSameDay(date, selected.to);
  const inRange =
    !!selected?.from &&
    !!selected.to &&
    isStrictlyBetween(date, selected.from, selected.to);

  const preview = showPreview
    ? getPreviewRange(selected, hoverDate)
    : undefined;
  const previewStart = !!preview?.from && isSameDay(date, preview.from);
  const previewEnd = !!preview?.to && isSameDay(date, preview.to);
  const previewInRange =
    !!preview?.from &&
    !!preview.to &&
    isStrictlyBetween(date, preview.from, preview.to);

  return {
    today: isSameDay(date, today),
    selected: rangeStart || rangeEnd,
    rangeStart,
    rangeEnd,
    inRange,
    previewStart,
    previewEnd,
    previewInRange,
  };
};
