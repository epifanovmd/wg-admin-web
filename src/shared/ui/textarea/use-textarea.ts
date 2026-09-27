import { useMergedRef } from "@mantine/hooks";
import { getHotkeyHandler } from "@shared/lib/hotkeys";
import * as React from "react";

import { clearNativeField } from "../foundation";
import { measureAutosize } from "./textarea-autosize";

type TextareaValue = React.TextareaHTMLAttributes<HTMLTextAreaElement>["value"];
type TextareaKeyboardEvent = React.KeyboardEvent<HTMLTextAreaElement>;

interface UseTextareaOptions {
  ref: React.ForwardedRef<HTMLTextAreaElement>;
  value: TextareaValue;
  defaultValue: React.TextareaHTMLAttributes<HTMLTextAreaElement>["defaultValue"];
  autoResize: boolean;
  minRows: number;
  maxRows: number;
  maxLength: number | undefined;
  disabled: boolean;
  readOnly: boolean;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement> | undefined;
  onClear: (() => void) | undefined;
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> | undefined;
  onSubmitShortcut: ((event: TextareaKeyboardEvent) => void) | undefined;
}

interface UseTextareaResult {
  setRef: (el: HTMLTextAreaElement | null) => void;
  charCount: number;
  counterTone: string;
  hasValue: boolean;
  isControlled: boolean;
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  handleClear: () => void;
  handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>;
}

/** Доля лимита, после которой счётчик подсвечивается как предупреждение. */
const COUNTER_WARN_RATIO = 0.8;
const SUBMIT_HOTKEY = "mod+enter";

const getLength = (value: TextareaValue): number => String(value ?? "").length;

const getCounterTone = (
  charCount: number,
  maxLength: number | undefined,
): string => {
  if (maxLength === undefined) return "text-muted-foreground";
  if (charCount >= maxLength) return "text-destructive";
  if (charCount >= maxLength * COUNTER_WARN_RATIO) return "text-warning";

  return "text-muted-foreground";
};

/**
 * Внутренняя логика Textarea: высота по содержимому в пределах
 * `[minRows, maxRows]`, счётчик символов, очистка и отправка по Ctrl/Cmd+Enter.
 */
export const useTextarea = ({
  ref,
  value,
  defaultValue,
  autoResize,
  minRows,
  maxRows,
  maxLength,
  disabled,
  readOnly,
  onChange,
  onClear,
  onKeyDown,
  onSubmitShortcut,
}: UseTextareaOptions): UseTextareaResult => {
  const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
  const setRef = useMergedRef(ref, innerRef);
  const isControlled = value !== undefined;

  const [uncontrolledCount, setUncontrolledCount] = React.useState(() =>
    getLength(defaultValue),
  );
  const charCount = isControlled ? getLength(value) : uncontrolledCount;
  const counterTone = getCounterTone(charCount, maxLength);

  const adjustHeight = React.useCallback(() => {
    const el = innerRef.current;

    if (!el) return;

    el.style.height = "auto";

    const { height, overflow } = measureAutosize(el, minRows, maxRows);

    el.style.height = `${height}px`;
    el.style.overflowY = overflow ? "auto" : "hidden";
  }, [minRows, maxRows]);

  React.useLayoutEffect(() => {
    if (autoResize) adjustHeight();
  }, [autoResize, adjustHeight, value]);

  // Ширина меняет перенос строк, а шрифт после загрузки — высоту строки.
  React.useEffect(() => {
    if (!autoResize) return undefined;

    const parent = innerRef.current?.parentElement;

    if (!parent) return undefined;

    let prevWidth = parent.offsetWidth;
    let active = true;

    const observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;

      if (width !== prevWidth) {
        prevWidth = width;
        adjustHeight();
      }
    });

    observer.observe(parent);
    void document.fonts?.ready.then(() => {
      if (active) adjustHeight();
    });

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [autoResize, adjustHeight]);

  const handleChange = React.useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement>
  >(
    event => {
      if (autoResize) adjustHeight();
      if (!isControlled) setUncontrolledCount(event.currentTarget.value.length);
      onChange?.(event);
    },
    [adjustHeight, autoResize, isControlled, onChange],
  );

  const handleClear = React.useCallback(() => {
    const el = innerRef.current;

    if (!el || disabled || readOnly) return;

    clearNativeField(el);
    onClear?.();
  }, [disabled, onClear, readOnly]);

  const submitHandler = React.useMemo(
    () =>
      onSubmitShortcut
        ? getHotkeyHandler<TextareaKeyboardEvent>([
            [SUBMIT_HOTKEY, onSubmitShortcut],
          ])
        : undefined,
    [onSubmitShortcut],
  );

  const handleKeyDown = React.useCallback<
    React.KeyboardEventHandler<HTMLTextAreaElement>
  >(
    event => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) submitHandler?.(event);
    },
    [onKeyDown, submitHandler],
  );

  return {
    setRef,
    charCount,
    counterTone,
    hasValue: charCount > 0,
    isControlled,
    handleChange,
    handleClear,
    handleKeyDown,
  };
};
