import type { Locale } from "date-fns";
import type * as React from "react";

import type { DateRangeMaskValue } from "../masked-input";

export type ViewMode = "day" | "month" | "year";

/** Диапазон дат — тот же тип, что у маски периода. */
export type DateRange = DateRangeMaskValue;

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Общие пропсы локализации календарей и пикеров. */
export interface CalendarLocaleProps {
  /** Локаль date-fns (по умолчанию `ru`). */
  locale?: Locale;
  /** Первый день недели (по умолчанию — из локали). */
  weekStartsOn?: WeekStartsOn;
}

/** Ограничения выбора: применяются к навигации, ячейкам и маске ввода. */
export interface DateBoundsProps {
  minDate?: Date;
  maxDate?: Date;
  disableDate?: (date: Date) => boolean;
}

/** Состояние ячейки дня — флаги, из которых `dayCellVariants` строит классы. */
export interface DayFlags {
  today: boolean;
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  inRange: boolean;
  previewStart: boolean;
  previewEnd: boolean;
  previewInRange: boolean;
}

export interface DateRangePreset {
  label: string;
  range: DateRange;
}

/** Пропсы поля пикера, общие для всех четырёх пикеров. */
export interface PickerFieldProps<TElement extends HTMLElement>
  extends CalendarLocaleProps, DateBoundsProps {
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** date-fns формат отображения. */
  dateFormat?: string;
  clearable?: boolean;
  /** Управляемое открытие попапа. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onBlur?: React.FocusEventHandler<TElement>;
  onFocus?: React.FocusEventHandler<TElement>;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-labelledby"?: string;
  "aria-required"?: boolean;
}

/** Выбор времени в пикерах одной даты. */
export interface PickerTimeProps {
  /**
   * Выбирать и время: под календарём появляется поле «чч:мм», значение
   * хранит часы и минуты, формат по умолчанию дополняется временем.
   * Время без выбранного дня применяется к сегодняшнему дню.
   */
  withTime?: boolean;
  /** Шаг ArrowUp/ArrowDown в поле времени, минут (по умолчанию 30). */
  timeStep?: number;
}
