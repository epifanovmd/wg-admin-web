import { useMergedRef } from "@mantine/hooks";
import type { FactoryOpts } from "imask";
import * as React from "react";

import { Input, type InputProps } from "../input";
import {
  type MaskedInputChangeInfo,
  type MaskedValueMode,
  useMaskedInput,
} from "./hooks";

export interface MaskedInputProps<
  Opts extends FactoryOpts = FactoryOpts,
> extends Omit<InputProps, "value" | "defaultValue" | "onChange" | "type"> {
  /** Опции imask; должны быть стабильны по identity (`useMemo`/константа). */
  mask: Opts;
  value?: string;
  defaultValue?: string;
  /** В какой форме приходит `value`: маскированной или «сырой». */
  valueMode?: MaskedValueMode;
  onChange?: (info: MaskedInputChangeInfo<Opts>) => void;
  onComplete?: (info: MaskedInputChangeInfo<Opts>) => void;
}

const MaskedInputInner = <Opts extends FactoryOpts>(
  {
    mask,
    value,
    defaultValue,
    valueMode,
    onChange,
    onComplete,
    disabled,
    onClear,
    ...props
  }: MaskedInputProps<Opts>,
  forwardedRef: React.Ref<HTMLInputElement>,
) => {
  const {
    ref,
    value: maskedValue,
    clear,
  } = useMaskedInput<Opts>({
    mask,
    value: value ?? defaultValue,
    valueMode,
    disabled,
    onChange,
    onComplete,
  });

  const mergedRef = useMergedRef(forwardedRef, ref);

  const handleClear = () => {
    clear();
    onClear?.();
  };

  // Стартовое значение в DOM до инициализации imask — только в masked-форме.
  const initialValue =
    valueMode === "unmasked" ? undefined : (value ?? defaultValue);

  return (
    <Input
      ref={mergedRef}
      disabled={disabled}
      defaultValue={initialValue}
      hasValue={maskedValue.length > 0}
      onClear={handleClear}
      {...props}
    />
  );
};

const MaskedInputForwarded = React.forwardRef(MaskedInputInner);

MaskedInputForwarded.displayName = "MaskedInput";

export const MaskedInput = MaskedInputForwarded as <
  Opts extends FactoryOpts = FactoryOpts,
>(
  props: MaskedInputProps<Opts> & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement;
