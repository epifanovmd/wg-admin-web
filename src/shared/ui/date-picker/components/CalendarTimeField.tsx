import * as React from "react";

import { Input } from "../../input";
import { timeMask, useMaskedInput } from "../../masked-input";
import {
  DEFAULT_TIME_STEP,
  formatTime,
  parseTime,
  shiftTime,
  type TimeParts,
} from "../utils";

export interface CalendarTimeFieldProps {
  /** Дата, чьё время показывается в поле. */
  value?: Date;
  /** Полное корректное время, введённое или изменённое стрелками. */
  onTimeChange: (time: TimeParts) => void;
  /** Шаг ArrowUp/ArrowDown, минут. */
  step?: number;
  label?: string;
  disabled?: boolean;
}

const ROOT_CLASS =
  "flex items-center justify-between gap-3 border-t border-border px-3 py-2.5";
const LABEL_CLASS = "text-sm text-muted-foreground";
const INPUT_ROOT_CLASS = "w-24";
const INPUT_CLASS = "text-center tabular-nums";

const STEP_DIRECTION: Record<string, 1 | -1> = { ArrowUp: 1, ArrowDown: -1 };

const timeOf = (date: Date | undefined): TimeParts =>
  date
    ? { hours: date.getHours(), minutes: date.getMinutes() }
    : { hours: 0, minutes: 0 };

/**
 * Поле времени под календарём: ввод по маске «чч:мм», ArrowUp/ArrowDown
 * сдвигают время на `step` минут. Неполный ввод откатывается при потере фокуса.
 */
export const CalendarTimeField = ({
  value,
  onTimeChange,
  step = DEFAULT_TIME_STEP,
  label = "Время",
  disabled,
}: CalendarTimeFieldProps) => {
  const id = React.useId();
  const displayValue = formatTime(value);

  const masked = useMaskedInput({
    mask: timeMask,
    value: displayValue,
    disabled,
    onChange: ({ value: text, isComplete }) => {
      const time = isComplete ? parseTime(text) : undefined;

      if (time) onTimeChange(time);
    },
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const direction = STEP_DIRECTION[event.key];

    if (direction === undefined) return;
    event.preventDefault();

    const current = parseTime(masked.value) ?? timeOf(value);

    onTimeChange(shiftTime(current, direction * step));
  };

  const handleBlur = () => {
    if (!masked.isComplete) masked.setValue(displayValue);
  };

  return (
    <div className={ROOT_CLASS} data-slot="calendar-time">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <Input
        ref={masked.ref}
        id={id}
        size="sm"
        className={INPUT_ROOT_CLASS}
        inputClassName={INPUT_CLASS}
        defaultValue={displayValue}
        hasValue={masked.value.length > 0}
        placeholder="чч:мм"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
    </div>
  );
};
