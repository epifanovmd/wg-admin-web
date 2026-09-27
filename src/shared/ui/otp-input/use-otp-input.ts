import { useControllableState, useLatestRef } from "@shared/lib/hooks";
import * as React from "react";

/** Набор допустимых символов: только цифры или латиница с цифрами. */
export type OtpInputMode = "numeric" | "alphanumeric";

export interface UseOtpInputOptions {
  /** Количество ячеек. */
  length: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Вызывается, когда пользователь заполнил все ячейки. */
  onComplete?: (value: string) => void;
  mode?: OtpInputMode;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface OtpCellHandlers {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  onPaste: React.ClipboardEventHandler<HTMLInputElement>;
  onFocus: React.FocusEventHandler<HTMLInputElement>;
}

export interface UseOtpInputResult {
  value: string;
  /** Символ каждой ячейки; пустая строка — ячейка не заполнена. */
  chars: string[];
  /** Стабильные ref-колбэки ячеек по индексу. */
  cellRefs: React.RefCallback<HTMLInputElement>[];
  getCellHandlers: (index: number) => OtpCellHandlers;
}

const MODE_PATTERN: Record<OtpInputMode, RegExp> = {
  numeric: /\d/,
  alphanumeric: /[A-Za-z0-9]/,
};

const filterChars = (text: string, mode: OtpInputMode): string =>
  Array.from(text)
    .filter(char => MODE_PATTERN[mode].test(char))
    .join("");

const removeAt = (value: string, index: number): string =>
  value.slice(0, index) + value.slice(index + 1);

/**
 * Символ, введённый поверх уже заполненной ячейки: браузер кладёт в поле
 * старый и новый символ рядом (каретка до или после), нужен только новый.
 */
const resolveTypedChars = (typed: string, previous: string): string => {
  if (!previous || typed.length !== 2) return typed;
  if (typed[0] === previous) return typed.slice(1);
  if (typed[1] === previous) return typed.slice(0, 1);

  return typed;
};

/**
 * Headless-логика OTP-поля: значение без «дыр» (символы идут подряд с
 * первой ячейки), ввод с переходом вперёд, Backspace/Delete, стрелки,
 * вставка и автозаполнение кода целиком. Фокус не уходит дальше первой
 * пустой ячейки.
 */
export const useOtpInput = ({
  length,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onComplete,
  mode = "numeric",
  disabled = false,
  readOnly = false,
}: UseOtpInputOptions): UseOtpInputResult => {
  const normalize = (text: string) => filterChars(text, mode).slice(0, length);

  const [rawValue, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const value = normalize(rawValue);

  // Последнее записанное значение: фокус переходит синхронно, раньше ре-рендера.
  const valueRef = React.useRef(value);

  valueRef.current = value;

  const onCompleteRef = useLatestRef(onComplete);
  const cellElementsRef = React.useRef<(HTMLInputElement | null)[]>([]);

  const cellRefs = React.useMemo(
    () =>
      Array.from(
        { length },
        (_, index): React.RefCallback<HTMLInputElement> =>
          element => {
            cellElementsRef.current[index] = element;
          },
      ),
    [length],
  );

  const focusCell = (index: number) => {
    const target = Math.max(0, Math.min(index, length - 1));

    cellElementsRef.current[target]?.focus();
  };

  const commit = (next: string, focusIndex: number) => {
    const normalized = next.slice(0, length);
    const changed = normalized !== valueRef.current;

    valueRef.current = normalized;

    if (changed) {
      setValue(normalized);
      if (normalized.length === length) onCompleteRef.current?.(normalized);
    }

    focusCell(focusIndex);
  };

  const insertAt = (index: number, chars: string) => {
    if (chars.length >= length) {
      commit(chars, length - 1);

      return;
    }

    const current = valueRef.current;
    const start = Math.min(index, current.length);
    const next =
      current.slice(0, start) + chars + current.slice(start + chars.length);

    commit(next, start + chars.length);
  };

  const isLocked = disabled || readOnly;

  const getCellHandlers = (index: number): OtpCellHandlers => ({
    onChange: event => {
      if (isLocked) return;

      const typed = filterChars(event.currentTarget.value, mode);
      const previous = valueRef.current[index] ?? "";

      if (event.currentTarget.value === "") {
        commit(removeAt(valueRef.current, index), index);

        return;
      }

      if (typed === "") return;

      insertAt(index, resolveTypedChars(typed, previous));
    },
    onKeyDown: event => {
      const current = valueRef.current;

      switch (event.key) {
        case "Backspace": {
          event.preventDefault();
          if (isLocked) return;

          if (current[index]) commit(removeAt(current, index), index);
          else if (index > 0) commit(removeAt(current, index - 1), index - 1);

          return;
        }
        case "Delete": {
          event.preventDefault();
          if (!isLocked && current[index]) {
            commit(removeAt(current, index), index);
          }

          return;
        }
        case "ArrowLeft":
          event.preventDefault();
          focusCell(index - 1);

          return;
        case "ArrowRight":
          event.preventDefault();
          focusCell(index + 1);

          return;
        case "Home":
          event.preventDefault();
          focusCell(0);

          return;
        case "End":
          event.preventDefault();
          focusCell(current.length);

          return;
        default:
          // Тот же символ поверх выделенного не даёт change — просто идём дальше.
          if (event.key.length === 1 && event.key === current[index]) {
            event.preventDefault();
            focusCell(index + 1);
          }
      }
    },
    onPaste: event => {
      event.preventDefault();
      if (isLocked) return;

      const pasted = filterChars(event.clipboardData.getData("text"), mode);

      if (pasted) insertAt(index, pasted.slice(0, length));
    },
    onFocus: event => {
      const firstEmpty = Math.min(valueRef.current.length, length - 1);

      if (index > firstEmpty) {
        focusCell(firstEmpty);

        return;
      }

      event.currentTarget.select();
    },
  });

  const chars = Array.from({ length }, (_, index) => value[index] ?? "");

  return { value, chars, cellRefs, getCellHandlers };
};
