import { useMergedRef } from "@mantine/hooks";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { isInvalidVariant } from "../foundation";
import {
  otpGroupVariants,
  type OtpInputVariantProps,
} from "./otp-input-variants";
import { OtpInputCell } from "./OtpInputCell";
import { type OtpInputMode, useOtpInput } from "./use-otp-input";

export interface OtpInputProps
  extends
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      "defaultValue" | "onChange" | "onPaste" | "role"
    >,
    OtpInputVariantProps {
  /** Количество ячеек (по умолчанию 6). */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Пользователь заполнил все ячейки (вводом, вставкой или автозаполнением). */
  onComplete?: (value: string) => void;
  /** `numeric` — только цифры и цифровая клавиатура; `alphanumeric` — латиница и цифры. */
  mode?: OtpInputMode;
  /** Показывать «•» вместо введённых символов. */
  mask?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  /** id первой ячейки — на неё указывает `<label for>`. */
  id?: string;
  /** Имя скрытого input со значением для нативной отправки формы. */
  name?: string;
  /**
   * Позиции визуального разделителя — сколько ячеек стоит перед ним:
   * `3` для «123–456», `[2, 4]` для «12–34–56».
   */
  separator?: number | number[];
  /** Содержимое разделителя (по умолчанию «–»). */
  separatorContent?: React.ReactNode;
  /** Подпись ячейки для скринридеров (по умолчанию «Символ N из M»). */
  getCellLabel?: (index: number, length: number) => string;
  /** Класс каждой ячейки; `className` относится к группе. */
  cellClassName?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

const DEFAULT_LENGTH = 6;
const MASK_CHAR = "•";
const SEPARATOR_CLASS = "select-none text-muted-foreground";

const defaultCellLabel = (index: number, length: number): string =>
  `Символ ${index + 1} из ${length}`;

const toSeparatorSet = (separator: OtpInputProps["separator"]): Set<number> => {
  if (separator === undefined) return new Set();

  return new Set(Array.isArray(separator) ? separator : [separator]);
};

/**
 * Поле одноразового кода из отдельных ячеек. ref указывает на первую
 * ячейку (фокус из формы), `aria-describedby`/`aria-invalid`/`aria-required`
 * уходят в каждую ячейку, `aria-label`/`aria-labelledby` — группе.
 */
export const OtpInput = React.forwardRef<HTMLInputElement, OtpInputProps>(
  (
    {
      length: lengthProp = DEFAULT_LENGTH,
      value,
      defaultValue,
      onValueChange,
      onComplete,
      mode = "numeric",
      mask = false,
      disabled = false,
      readOnly = false,
      autoFocus,
      id,
      name,
      separator,
      separatorContent = "–",
      getCellLabel = defaultCellLabel,
      size,
      variant,
      className,
      cellClassName,
      onBlur,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      "aria-required": ariaRequired,
      ...props
    },
    ref,
  ) => {
    const length = Math.max(1, Math.floor(lengthProp));
    const otp = useOtpInput({
      length,
      value,
      defaultValue,
      onValueChange,
      onComplete,
      mode,
      disabled,
      readOnly,
    });
    const firstCellRef = useMergedRef(ref, otp.cellRefs[0]);
    const separators = toSeparatorSet(separator);
    const invalid = ariaInvalid ?? (isInvalidVariant(variant) || undefined);
    const inputMode = mode === "numeric" ? "numeric" : "text";

    // Blur группы — только когда фокус ушёл из всех ячеек.
    const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      onBlur?.(event);
    };

    return (
      <div
        role="group"
        className={cn(otpGroupVariants({ size }), className)}
        data-slot="otp-input"
        data-complete={otp.value.length === length}
        onBlur={handleBlur}
        {...props}
      >
        {otp.chars.map((char, index) => (
          <React.Fragment key={index}>
            <OtpInputCell
              ref={index === 0 ? firstCellRef : otp.cellRefs[index]}
              id={index === 0 ? id : undefined}
              value={mask && char ? MASK_CHAR : char}
              size={size}
              variant={variant}
              className={cellClassName}
              inputMode={inputMode}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              autoFocus={index === 0 ? autoFocus : undefined}
              disabled={disabled}
              readOnly={readOnly}
              aria-label={getCellLabel(index, length)}
              aria-describedby={ariaDescribedBy}
              aria-invalid={invalid}
              aria-required={ariaRequired}
              {...otp.getCellHandlers(index)}
            />
            {separators.has(index + 1) && index + 1 < length && (
              <span
                aria-hidden
                className={SEPARATOR_CLASS}
                data-slot="otp-input-separator"
              >
                {separatorContent}
              </span>
            )}
          </React.Fragment>
        ))}
        {name && <input type="hidden" name={name} value={otp.value} />}
      </div>
    );
  },
);

OtpInput.displayName = "OtpInput";
