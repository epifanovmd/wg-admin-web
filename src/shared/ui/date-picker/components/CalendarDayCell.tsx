import { cn } from "@shared/lib/utils";
import * as React from "react";

import type { DayFlags } from "../types";
import {
  dayCellVariants,
  dayRangeVariants,
  resolveDayTone,
  resolvePreviewSpan,
  resolveRangeSpan,
} from "./calendar-day-variants";

export interface CalendarDayCellProps {
  date: Date;
  /** Ключ для `data-date` (фокус из клавиатурной навигации). */
  dateKey: string;
  /** Полная дата для `aria-label`. */
  label: string;
  flags: DayFlags;
  disabled: boolean;
  /** Roving tabindex: только одна ячейка в Tab-порядке. */
  focusable: boolean;
  onSelect: (date: Date) => void;
  onHover: (date: Date | undefined) => void;
  onFocus: (date: Date) => void;
}

const BUTTON_CLASS =
  "group relative z-10 inline-flex h-full w-full items-center justify-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

const CalendarDayCellInner = ({
  date,
  dateKey,
  label,
  flags,
  disabled,
  focusable,
  onSelect,
  onHover,
  onFocus,
}: CalendarDayCellProps) => {
  const handleMouseEnter = () => onHover(disabled ? undefined : date);
  const handleClick = () => onSelect(date);
  const handleFocus = () => onFocus(date);

  const rangeSpan = resolveRangeSpan(flags);
  const previewSpan = resolvePreviewSpan(flags);

  return (
    <div
      role="gridcell"
      aria-selected={flags.selected || undefined}
      className="relative flex h-9 items-center justify-center"
      onMouseEnter={handleMouseEnter}
    >
      {rangeSpan !== "none" && (
        <div className={dayRangeVariants({ span: rangeSpan })} />
      )}
      {previewSpan !== "none" && (
        <div
          className={dayRangeVariants({ span: previewSpan, preview: true })}
        />
      )}
      <button
        type="button"
        data-date={dateKey}
        tabIndex={focusable ? 0 : -1}
        disabled={disabled}
        aria-label={label}
        aria-current={flags.today ? "date" : undefined}
        onClick={handleClick}
        onFocus={handleFocus}
        className={cn(
          BUTTON_CLASS,
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span
          className={dayCellVariants({ tone: resolveDayTone(flags), disabled })}
        >
          {date.getDate()}
        </span>
      </button>
    </div>
  );
};

const areFlagsEqual = (a: DayFlags, b: DayFlags): boolean =>
  (Object.keys(a) as (keyof DayFlags)[]).every(key => a[key] === b[key]);

const arePropsEqual = (
  prev: CalendarDayCellProps,
  next: CalendarDayCellProps,
): boolean =>
  prev.dateKey === next.dateKey &&
  prev.label === next.label &&
  prev.disabled === next.disabled &&
  prev.focusable === next.focusable &&
  prev.onSelect === next.onSelect &&
  prev.onHover === next.onHover &&
  prev.onFocus === next.onFocus &&
  areFlagsEqual(prev.flags, next.flags);

/** 42 ячейки перерисовываются на каждый hover — memo оправдан;
 *  `flags` пересоздаются на каждый рендер, поэтому сравниваются по полям. */
export const CalendarDayCell = React.memo(CalendarDayCellInner, arePropsEqual);

CalendarDayCell.displayName = "CalendarDayCell";
