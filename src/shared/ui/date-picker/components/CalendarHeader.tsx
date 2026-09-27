import { cn } from "@shared/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ViewMode } from "../types";

export interface CalendarHeaderProps {
  headerText: string;
  viewMode: ViewMode;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onHeaderClick: () => void;
}

const NAV_BUTTON_CLASS =
  "h-7 w-7 p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md transition-opacity cursor-pointer disabled:cursor-not-allowed disabled:opacity-20";

const TITLE_CLASS =
  "text-sm font-medium hover:bg-accent px-3 py-1 rounded-md transition-colors cursor-pointer disabled:cursor-default disabled:hover:bg-transparent";

const PREVIOUS_LABEL: Record<ViewMode, string> = {
  day: "Предыдущий месяц",
  month: "Предыдущий год",
  year: "Предыдущие годы",
};

const NEXT_LABEL: Record<ViewMode, string> = {
  day: "Следующий месяц",
  month: "Следующий год",
  year: "Следующие годы",
};

export const CalendarHeader = ({
  headerText,
  viewMode,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onHeaderClick,
}: CalendarHeaderProps) => (
  <div className="flex items-center justify-between p-3 border-b">
    <button
      type="button"
      aria-label={PREVIOUS_LABEL[viewMode]}
      disabled={!canGoPrevious}
      onClick={onPrevious}
      className={NAV_BUTTON_CLASS}
    >
      <ChevronLeft aria-hidden className="h-4 w-4" />
    </button>
    <button
      type="button"
      aria-live="polite"
      disabled={viewMode === "year"}
      onClick={onHeaderClick}
      className={cn(TITLE_CLASS)}
    >
      {headerText}
    </button>
    <button
      type="button"
      aria-label={NEXT_LABEL[viewMode]}
      disabled={!canGoNext}
      onClick={onNext}
      className={NAV_BUTTON_CLASS}
    >
      <ChevronRight aria-hidden className="h-4 w-4" />
    </button>
  </div>
);
