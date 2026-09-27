import { cn } from "@shared/lib/utils";
import * as React from "react";

export interface TimeListProps {
  /** Варианты времени «HH:mm» по возрастанию. */
  options: string[];
  /** Выбранное время «HH:mm». */
  selected?: string;
  onSelect: (time: string) => void;
  "aria-label"?: string;
  className?: string;
}

const LIST_CLASS =
  "flex max-h-60 min-w-28 flex-col gap-0.5 overflow-y-auto p-1";
const OPTION_CLASS =
  "cursor-pointer rounded-md px-3 py-1.5 text-left text-sm tabular-nums outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:shadow-focus aria-selected:bg-primary aria-selected:text-primary-foreground";

const KEY_STEP: Record<string, number | "first" | "last"> = {
  ArrowDown: 1,
  ArrowUp: -1,
  PageDown: 4,
  PageUp: -4,
  Home: "first",
  End: "last",
};

/** Индекс выбранного времени или ближайшего следующего — с него начинается Tab-фокус. */
const resolveActiveIndex = (options: string[], selected?: string): number => {
  if (!selected) return 0;

  const nextIndex = options.findIndex(option => option >= selected);

  return nextIndex === -1 ? options.length - 1 : nextIndex;
};

/**
 * Список времени (WAI-ARIA listbox) с roving tabindex: стрелки, PageUp/Down,
 * Home/End двигают фокус, Enter/Space выбирают. При открытии выбранный
 * вариант прокручивается в видимую область.
 */
export const TimeList = ({
  options,
  selected,
  onSelect,
  "aria-label": ariaLabel = "Время",
  className,
}: TimeListProps) => {
  const optionRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(() =>
    resolveActiveIndex(options, selected),
  );

  // Прокрутка только при открытии: дальше фокус сам держит вариант в зоне видимости.
  const initialIndexRef = React.useRef(activeIndex);

  React.useEffect(() => {
    const active = optionRefs.current[initialIndexRef.current];

    if (active && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ block: "center" });
    }
  }, []);

  const moveFocus = (index: number) => {
    const target = Math.max(0, Math.min(index, options.length - 1));

    setActiveIndex(target);
    optionRefs.current[target]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[activeIndex];

      if (option !== undefined) onSelect(option);

      return;
    }

    const step = KEY_STEP[event.key];

    if (step === undefined) return;
    event.preventDefault();

    if (step === "first") moveFocus(0);
    else if (step === "last") moveFocus(options.length - 1);
    else moveFocus(activeIndex + step);
  };

  return (
    <div
      role="listbox"
      aria-label={ariaLabel}
      className={cn(LIST_CLASS, className)}
      onKeyDown={handleKeyDown}
    >
      {options.map((option, index) => (
        <div
          key={option}
          ref={element => {
            optionRefs.current[index] = element;
          }}
          role="option"
          aria-selected={option === selected}
          tabIndex={index === activeIndex ? 0 : -1}
          className={OPTION_CLASS}
          onClick={() => onSelect(option)}
          onFocus={() => setActiveIndex(index)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};
