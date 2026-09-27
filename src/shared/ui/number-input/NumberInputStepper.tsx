import { cn } from "@shared/lib/utils";
import { Minus, Plus } from "lucide-react";
import * as React from "react";

export interface NumberInputStepperProps {
  canIncrement: boolean;
  canDecrement: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  incrementLabel?: string;
  decrementLabel?: string;
  className?: string;
}

const ROOT_CLASS = "flex items-center gap-0.5";
const BUTTON_CLASS =
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40";
const ICON_CLASS = "h-3.5 w-3.5";

/** Клик мышью не уводит фокус из поля: редактирование продолжается. */
const preventFocusSteal = (event: React.PointerEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

/**
 * Кнопки «−» / «+» числового поля. Из Tab-порядка исключены — с клавиатуры
 * значение меняют стрелки в самом поле.
 */
export const NumberInputStepper = ({
  canIncrement,
  canDecrement,
  onIncrement,
  onDecrement,
  incrementLabel = "Увеличить",
  decrementLabel = "Уменьшить",
  className,
}: NumberInputStepperProps) => (
  <div className={cn(ROOT_CLASS, className)} data-slot="number-input-stepper">
    <button
      type="button"
      tabIndex={-1}
      aria-label={decrementLabel}
      disabled={!canDecrement}
      onPointerDown={preventFocusSteal}
      onClick={onDecrement}
      className={BUTTON_CLASS}
    >
      <Minus aria-hidden className={ICON_CLASS} />
    </button>
    <button
      type="button"
      tabIndex={-1}
      aria-label={incrementLabel}
      disabled={!canIncrement}
      onPointerDown={preventFocusSteal}
      onClick={onIncrement}
      className={BUTTON_CLASS}
    >
      <Plus aria-hidden className={ICON_CLASS} />
    </button>
  </div>
);
