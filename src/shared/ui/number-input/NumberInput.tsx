import * as React from "react";

import { Input, type InputProps } from "../input";
import { NumberInputStepper } from "./NumberInputStepper";
import { useNumberInput, type UseNumberInputOptions } from "./use-number-input";

export interface NumberInputProps
  extends
    Omit<
      InputProps,
      | "value"
      | "defaultValue"
      | "type"
      | "min"
      | "max"
      | "step"
      | "inputMode"
      | "role"
    >,
    Omit<UseNumberInputOptions, "disabled" | "readOnly"> {
  /** Скрыть кнопки «−» / «+». */
  hideControls?: boolean;
  incrementLabel?: string;
  decrementLabel?: string;
}

/**
 * Числовое поле на базе Input: `value` — число или `null`, без фокуса
 * значение форматируется Intl.NumberFormat (`ru-RU`), в фокусе правится как
 * текст; стрелки / PageUp / PageDown и кнопки меняют его на `step`.
 * Поддерживает все слоты Input (`prefix`/`suffix`, `clearable`, `leftIcon`…);
 * кнопки степпера стоят перед `rightAddon`.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step,
      precision,
      allowNegative,
      locale,
      formatOptions,
      hideControls = false,
      incrementLabel,
      decrementLabel,
      disabled,
      readOnly,
      rightAddon,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const number = useNumberInput({
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step,
      precision,
      allowNegative,
      locale,
      formatOptions,
      disabled,
      readOnly,
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      number.handleChange(event);
      onChange?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      number.handleFocus(event);
      onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      number.handleBlur(event);
      onBlur?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      number.handleKeyDown(event);
      onKeyDown?.(event);
    };

    const stepper = !hideControls && (
      <NumberInputStepper
        canIncrement={number.canIncrement}
        canDecrement={number.canDecrement}
        onIncrement={() => number.increment()}
        onDecrement={() => number.decrement()}
        incrementLabel={incrementLabel}
        decrementLabel={decrementLabel}
      />
    );
    const hasRightAddon = Boolean(stepper) || Boolean(rightAddon);

    return (
      <Input
        ref={ref}
        type="text"
        role="spinbutton"
        autoComplete="off"
        inputMode={number.inputMode}
        aria-valuenow={number.value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={number.formattedValue || undefined}
        disabled={disabled}
        readOnly={readOnly}
        {...props}
        value={number.inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        rightAddon={
          hasRightAddon ? (
            <>
              {stepper}
              {rightAddon}
            </>
          ) : undefined
        }
      />
    );
  },
);

NumberInput.displayName = "NumberInput";
