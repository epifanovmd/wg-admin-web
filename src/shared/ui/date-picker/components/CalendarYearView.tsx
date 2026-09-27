import { cn } from "@shared/lib/utils";

import { getYearPageStart, YEARS_PER_PAGE } from "../utils";

export interface CalendarYearViewProps {
  currentYear: number;
  /** Год выбранной даты. */
  selectedYear?: number;
  onYearSelect: (year: number) => void;
}

const YEAR_BUTTON_CLASS =
  "py-3 px-4 rounded-md text-sm transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground";

const SELECTED_CLASS =
  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground";

export const CalendarYearView = ({
  currentYear,
  selectedYear,
  onYearSelect,
}: CalendarYearViewProps) => {
  const startYear = getYearPageStart(currentYear);
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => startYear + i);

  return (
    <div className="p-3">
      <div className="grid grid-cols-3 gap-2">
        {years.map(year => (
          <button
            key={year}
            type="button"
            aria-pressed={selectedYear === year}
            onClick={() => onYearSelect(year)}
            className={cn(
              YEAR_BUTTON_CLASS,
              selectedYear === year && SELECTED_CLASS,
            )}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};
