import { cn } from "@shared/lib/utils";
import type { Locale } from "date-fns";
import * as React from "react";

import { getMonthNames } from "../utils";

export interface CalendarMonthViewProps {
  locale: Locale;
  /** Месяц выбранной даты (если она в просматриваемом году). */
  selectedMonth?: number;
  onMonthSelect: (month: number) => void;
}

const MONTH_BUTTON_CLASS =
  "py-3 px-4 rounded-md text-sm transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground";

const SELECTED_CLASS =
  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground";

export const CalendarMonthView = ({
  locale,
  selectedMonth,
  onMonthSelect,
}: CalendarMonthViewProps) => {
  const months = React.useMemo(() => getMonthNames(locale), [locale]);

  return (
    <div className="p-3">
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => (
          <button
            key={month}
            type="button"
            aria-pressed={selectedMonth === index}
            onClick={() => onMonthSelect(index)}
            className={cn(
              MONTH_BUTTON_CLASS,
              selectedMonth === index && SELECTED_CLASS,
            )}
          >
            {month}
          </button>
        ))}
      </div>
    </div>
  );
};
