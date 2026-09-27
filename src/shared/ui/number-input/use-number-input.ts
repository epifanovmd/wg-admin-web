import { useControllableState } from "@shared/lib/hooks";
import * as React from "react";

import {
  clamp,
  countDecimals,
  createInputPattern,
  createNumberFormatter,
  DEFAULT_NUMBER_LOCALE,
  getDecimalSeparator,
  parseNumberInput,
  roundTo,
  stripGroupSpaces,
  toEditableText,
} from "./number-format";

export interface UseNumberInputOptions {
  /** `null` — поле пустое. */
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Шаг стрелок и кнопок (по умолчанию 1); Shift / PageUp / PageDown — ×10. */
  step?: number;
  /** Знаков после запятой: ограничивает ввод и округляет значение. */
  precision?: number;
  /** Разрешить отрицательные числа (по умолчанию `true`). */
  allowNegative?: boolean;
  /** Локаль форматирования (по умолчанию `ru-RU`). */
  locale?: string;
  /** Опции Intl.NumberFormat для отображения без фокуса. */
  formatOptions?: Intl.NumberFormatOptions;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface UseNumberInputResult {
  value: number | null;
  /** Текст поля: форматированный без фокуса, редактируемый в фокусе. */
  inputValue: string;
  /** Отформатированное значение для `aria-valuetext`. */
  formattedValue: string;
  inputMode: "decimal" | "numeric";
  canIncrement: boolean;
  canDecrement: boolean;
  increment: (multiplier?: number) => void;
  decrement: (multiplier?: number) => void;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  handleFocus: React.FocusEventHandler<HTMLInputElement>;
  handleBlur: React.FocusEventHandler<HTMLInputElement>;
  handleKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
}

const LARGE_STEP_MULTIPLIER = 10;

/**
 * Headless-логика числового поля: пока поле в фокусе, пользователь правит
 * «сырой» текст (значение отдаётся на каждом корректном вводе), при потере
 * фокуса значение зажимается в `[min, max]`, округляется и форматируется.
 */
export const useNumberInput = ({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  step = 1,
  precision,
  allowNegative = true,
  locale = DEFAULT_NUMBER_LOCALE,
  formatOptions,
  disabled = false,
  readOnly = false,
}: UseNumberInputOptions): UseNumberInputResult => {
  const [value, setValue] = useControllableState<number | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const [draft, setDraft] = React.useState<string | null>(null);

  // Значение, записанное в этом же обработчике: фокус после очистки и
  // серия нажатий видят его раньше ре-рендера.
  const valueRef = React.useRef(value);

  valueRef.current = value;

  const formatter = React.useMemo(
    () => createNumberFormatter(locale, precision, formatOptions),
    [formatOptions, locale, precision],
  );
  const decimalSeparator = React.useMemo(
    () => getDecimalSeparator(locale),
    [locale],
  );
  const inputPattern = React.useMemo(
    () => createInputPattern(allowNegative, precision),
    [allowNegative, precision],
  );

  const isLocked = disabled || readOnly;
  const formattedValue = value === null ? "" : formatter.format(value);

  const emit = (next: number | null) => {
    if (next === valueRef.current) return;
    valueRef.current = next;
    setValue(next);
  };

  const normalize = (next: number): number => {
    const clamped = clamp(next, min, max);

    return precision === undefined ? clamped : roundTo(clamped, precision);
  };

  const stepBy = (direction: 1 | -1, multiplier = 1) => {
    if (isLocked) return;

    const current = valueRef.current;
    const decimals =
      precision ?? Math.max(countDecimals(step), countDecimals(current ?? 0));
    const raw = current === null ? 0 : current + direction * step * multiplier;
    const next = roundTo(clamp(raw, min, max), decimals);

    emit(next);
    if (draft !== null) setDraft(toEditableText(next, decimalSeparator));
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const text = stripGroupSpaces(event.currentTarget.value);

    if (!inputPattern.test(text)) return;

    setDraft(text);

    const parsed = parseNumberInput(text);

    if (parsed !== undefined) emit(parsed);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setDraft(
      current => current ?? toEditableText(valueRef.current, decimalSeparator),
    );
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    const parsed = draft === null ? valueRef.current : parseNumberInput(draft);
    const next = parsed == null ? null : normalize(parsed);

    setDraft(null);
    if (!isLocked) emit(next);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = event => {
    const large = event.shiftKey ? LARGE_STEP_MULTIPLIER : 1;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        stepBy(1, large);
        break;
      case "ArrowDown":
        event.preventDefault();
        stepBy(-1, large);
        break;
      case "PageUp":
        event.preventDefault();
        stepBy(1, LARGE_STEP_MULTIPLIER);
        break;
      case "PageDown":
        event.preventDefault();
        stepBy(-1, LARGE_STEP_MULTIPLIER);
        break;
    }
  };

  return {
    value,
    inputValue: draft ?? formattedValue,
    formattedValue,
    inputMode: allowNegative || precision !== 0 ? "decimal" : "numeric",
    canIncrement:
      !isLocked && (max === undefined || value === null || value < max),
    canDecrement:
      !isLocked && (min === undefined || value === null || value > min),
    increment: multiplier => stepBy(1, multiplier),
    decrement: multiplier => stepBy(-1, multiplier),
    handleChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
  };
};
