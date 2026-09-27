import { cn } from "@shared/lib/utils";
import { joinIds } from "@shared/lib/utils/join-ids";
import * as React from "react";

import { FieldClearButton, isInvalidVariant } from "../foundation";
import {
  type TextareaVariantProps,
  textareaVariants,
} from "./textarea-variants";
import { useTextarea } from "./use-textarea";

export type TextareaResize = "none" | "vertical";

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    TextareaVariantProps {
  /** Подстраивать высоту под содержимое в пределах `[minRows, maxRows]`. */
  autoResize?: boolean;
  /** Минимальная высота в строках (синоним `rows`). По умолчанию 3. */
  minRows?: number;
  /** Максимум строк до прокрутки; `Infinity` — без ограничения. По умолчанию 6. */
  maxRows?: number;
  /** Ручное растягивание; по умолчанию `none` при авторосте, иначе `vertical`. */
  resize?: TextareaResize;
  /** Показывать счётчик символов (с лимитом при заданном `maxLength`). */
  showCount?: boolean;
  /** Кнопка очистки, пока есть значение. */
  clearable?: boolean;
  onClear?: () => void;
  clearAriaLabel?: string;
  /** Отправка по Ctrl/Cmd+Enter; Enter по-прежнему переносит строку. */
  onSubmitShortcut?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Класс корневого контейнера; `className` относится к самому textarea. */
  wrapperClassName?: string;
}

const DEFAULT_ROWS = 3;
const DEFAULT_MAX_ROWS = 6;

const ROOT_CLASS = "flex w-full flex-col gap-1";
const FIELD_CLASS = "relative flex w-full";
const COUNTER_CLASS = "text-right text-xs tabular-nums";
const CLEAR_CLASS = "absolute right-2 top-2";
const CLEARABLE_PADDING_CLASS = "pr-9";
const RESIZE_CLASS: Record<TextareaResize, string> = {
  none: "resize-none",
  vertical: "resize-y",
};

/**
 * Многострочное поле: авторост по содержимому с границами в строках,
 * счётчик символов, очистка и отправка по Ctrl/Cmd+Enter.
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      wrapperClassName,
      size,
      variant,
      autoResize = true,
      rows,
      minRows,
      maxRows = DEFAULT_MAX_ROWS,
      resize,
      maxLength,
      showCount = false,
      clearable = false,
      onClear,
      clearAriaLabel = "Очистить",
      onSubmitShortcut,
      value,
      defaultValue,
      disabled = false,
      readOnly = false,
      onChange,
      onKeyDown,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const resolvedMinRows = rows ?? minRows ?? DEFAULT_ROWS;
    const {
      setRef,
      charCount,
      counterTone,
      hasValue,
      isControlled,
      handleChange,
      handleClear,
      handleKeyDown,
    } = useTextarea({
      ref,
      value,
      defaultValue,
      autoResize,
      minRows: resolvedMinRows,
      maxRows,
      maxLength,
      disabled,
      readOnly,
      onChange,
      onClear,
      onKeyDown,
      onSubmitShortcut,
    });

    const counterId = showCount ? `${generatedId}-counter` : undefined;
    const counterText =
      maxLength === undefined
        ? String(charCount)
        : `${charCount} / ${maxLength}`;
    const resolvedResize = resize ?? (autoResize ? "none" : "vertical");
    const showClearButton = clearable && hasValue && !disabled && !readOnly;
    const valueProps = isControlled ? { value } : { defaultValue };

    return (
      <div
        className={cn(ROOT_CLASS, wrapperClassName)}
        data-has-value={hasValue}
        data-size={size ?? "md"}
        data-slot="input-root"
      >
        <div className={FIELD_CLASS}>
          <textarea
            ref={setRef}
            rows={resolvedMinRows}
            maxLength={maxLength}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              textareaVariants({ size, variant }),
              RESIZE_CLASS[resolvedResize],
              clearable && CLEARABLE_PADDING_CLASS,
              className,
            )}
            data-slot="input"
            aria-describedby={joinIds(ariaDescribedBy, counterId)}
            aria-invalid={
              ariaInvalid ?? (isInvalidVariant(variant) || undefined)
            }
            {...valueProps}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...props}
          />
          {showClearButton && (
            <FieldClearButton
              aria-label={clearAriaLabel}
              onClear={handleClear}
              className={CLEAR_CLASS}
              data-slot="textarea-clear"
            />
          )}
        </div>
        {showCount && (
          <p
            id={counterId}
            aria-live="polite"
            className={cn(COUNTER_CLASS, counterTone)}
            data-slot="textarea-counter"
          >
            {counterText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
