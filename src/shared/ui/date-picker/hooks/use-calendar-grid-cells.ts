import { useMemo } from "react";

import type { WeekStartsOn } from "../types";
import { buildCalendarCells } from "../utils";

export interface UseCalendarGridCellsOptions {
  viewDate: Date;
  weekStartsOn: WeekStartsOn;
}

/** Ячейки месяца по неделям (`null` — пустая ячейка). */
export const useCalendarGridCells = ({
  viewDate,
  weekStartsOn,
}: UseCalendarGridCellsOptions): (Date | null)[] =>
  useMemo(
    () => buildCalendarCells(viewDate, weekStartsOn),
    [viewDate, weekStartsOn],
  );
