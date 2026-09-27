import { useMergedRef } from "@mantine/hooks";
import * as React from "react";

import { clearNativeField } from "../foundation";

type InputValue = React.InputHTMLAttributes<HTMLInputElement>["value"];

interface UseInputOptions {
  defaultValue: InputValue;
  disabled: boolean;
  forwardedRef: React.ForwardedRef<HTMLInputElement>;
  hasValue: boolean | undefined;
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
  onClear: (() => void) | undefined;
  readOnly: boolean;
  type: React.HTMLInputTypeAttribute;
  value: InputValue;
}

interface UseInputResult {
  hasValue: boolean;
  inputRef: React.RefCallback<HTMLInputElement>;
  inputType: React.HTMLInputTypeAttribute;
  isControlled: boolean;
  isPassword: boolean;
  isPasswordVisible: boolean;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
  handleClear: () => void;
  handlePasswordToggle: () => void;
}

const valueIsPresent = (value: InputValue): boolean =>
  value != null && String(value).length > 0;

/** Пишет значение через нативный сеттер, чтобы React увидел последующий `input`. */
/**
 * Внутренняя логика Input: наличие значения (controlled/uncontrolled/внешний
 * `hasValue`), очистка через нативное событие и видимость пароля.
 */
export const useInput = ({
  defaultValue,
  disabled,
  forwardedRef,
  hasValue: hasValueProp,
  onChange,
  onClear,
  readOnly,
  type,
  value,
}: UseInputOptions): UseInputResult => {
  const innerRef = React.useRef<HTMLInputElement>(null);
  const inputRef = useMergedRef(forwardedRef, innerRef);
  const isControlled = value !== undefined;
  const isPassword = type === "password";
  const tracksOwnValue = !isControlled && hasValueProp === undefined;

  const [hasUncontrolledValue, setHasUncontrolledValue] = React.useState(() =>
    valueIsPresent(defaultValue),
  );
  const [isPasswordShown, setIsPasswordShown] = React.useState(false);

  const hasValue =
    hasValueProp ??
    (isControlled ? valueIsPresent(value) : hasUncontrolledValue);
  const isPasswordVisible = isPasswordShown && isPassword && hasValue;

  const handleChange = React.useCallback<
    React.ChangeEventHandler<HTMLInputElement>
  >(
    event => {
      const isEmpty = event.currentTarget.value.length === 0;

      if (tracksOwnValue) setHasUncontrolledValue(!isEmpty);
      if (isEmpty) setIsPasswordShown(false);

      onChange?.(event);
    },
    [onChange, tracksOwnValue],
  );

  const handleClear = React.useCallback(() => {
    if (disabled || readOnly) return;

    const input = innerRef.current;

    if (input) {
      clearNativeField(input);
    }

    if (tracksOwnValue) setHasUncontrolledValue(false);

    setIsPasswordShown(false);
    onClear?.();
  }, [disabled, onClear, readOnly, tracksOwnValue]);

  const handlePasswordToggle = React.useCallback(() => {
    if (disabled) return;
    setIsPasswordShown(isShown => !isShown);
  }, [disabled]);

  const inputType = isPasswordVisible ? "text" : type;

  return {
    hasValue,
    inputRef,
    inputType,
    isControlled,
    isPassword,
    isPasswordVisible,
    handleChange,
    handleClear,
    handlePasswordToggle,
  };
};
