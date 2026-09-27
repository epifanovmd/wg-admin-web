import { cva } from "class-variance-authority";

import type { DayFlags } from "../types";

/** Кружок с числом: сегодня / выбрано / обычный день. */
export const dayCellVariants = cva(
  "inline-flex h-8 w-8 items-center justify-center rounded-full",
  {
    variants: {
      tone: {
        default: "group-hover:bg-accent group-hover:text-accent-foreground",
        today:
          "bg-info text-info-foreground group-hover:bg-info group-hover:text-info-foreground",
        selected:
          "bg-primary text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground",
      },
      disabled: {
        true: "opacity-40 group-hover:bg-transparent group-hover:text-inherit",
        false: "",
      },
    },
    defaultVariants: { tone: "default", disabled: false },
  },
);

/** Подложка диапазона за кружком: полная, от середины, до середины. */
export const dayRangeVariants = cva("absolute inset-y-2", {
  variants: {
    span: {
      none: "hidden",
      full: "left-0 right-0",
      start: "left-1/2 right-0",
      end: "left-0 right-1/2",
    },
    preview: {
      true: "bg-primary/8",
      false: "bg-primary/15",
    },
  },
  defaultVariants: { span: "none", preview: false },
});

export type DayTone = "default" | "today" | "selected";
export type DayRangeSpan = "none" | "full" | "start" | "end";

export const resolveDayTone = (flags: DayFlags): DayTone => {
  if (flags.selected) return "selected";
  if (flags.today) return "today";

  return "default";
};

/** Форма подложки выбранного диапазона; один день (start = end) — без подложки. */
export const resolveRangeSpan = (flags: DayFlags): DayRangeSpan => {
  if (flags.inRange) return "full";
  if (flags.rangeStart && flags.rangeEnd) return "none";
  if (flags.rangeStart) return "start";
  if (flags.rangeEnd) return "end";

  return "none";
};

export const resolvePreviewSpan = (flags: DayFlags): DayRangeSpan => {
  if (flags.previewInRange) return "full";
  if (flags.previewStart) return "start";
  if (flags.previewEnd) return "end";

  return "none";
};
