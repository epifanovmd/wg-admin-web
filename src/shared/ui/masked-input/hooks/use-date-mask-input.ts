import { useLatestRef } from "@shared/lib/hooks";
import { format as formatDate } from "date-fns";
import type { FactoryOpts } from "imask";
import { type RefObject, useCallback, useMemo } from "react";

import { createDateMask, type CreateDateMaskOptions } from "../masks";
import { type MaskedInputChangeInfo, useMaskedInput } from "./use-masked-input";

export interface UseDateMaskInputOptions extends CreateDateMaskOptions {
  value?: Date;
  disabled?: boolean;
  /** Вызывается только законченными состояниями: полная дата или пустая
   *  строка (`undefined`). Незавершённый ввод значение не трогает. */
  onChange?: (date: Date | undefined) => void;
  onComplete?: (date: Date | undefined) => void;
}

export interface UseDateMaskInputResult {
  ref: RefObject<HTMLInputElement | null>;
  displayValue: string;
  isComplete: boolean;
  setDate: (date: Date | undefined) => void;
  clear: () => void;
}

const unwrapDate = (typedValue: unknown): Date | undefined =>
  (typedValue as Date | null) ?? undefined;

export const useDateMaskInput = ({
  value,
  disabled,
  dateFormat = "dd.MM.yyyy",
  min,
  max,
  onChange,
  onComplete,
}: UseDateMaskInputOptions): UseDateMaskInputResult => {
  const mask = useMemo(
    () => createDateMask({ dateFormat, min, max }),
    [dateFormat, min, max],
  );

  const onChangeRef = useLatestRef(onChange);
  const onCompleteRef = useLatestRef(onComplete);

  const toDisplay = useCallback(
    (date: Date | undefined) => (date ? formatDate(date, dateFormat) : ""),
    [dateFormat],
  );

  const handleChange = useCallback(
    (info: MaskedInputChangeInfo<FactoryOpts>) => {
      if (info.value === "") onChangeRef.current?.(undefined);
      else if (info.isComplete)
        onChangeRef.current?.(unwrapDate(info.typedValue));
    },
    [onChangeRef],
  );

  const handleComplete = useCallback(
    (info: MaskedInputChangeInfo<FactoryOpts>) =>
      onCompleteRef.current?.(unwrapDate(info.typedValue)),
    [onCompleteRef],
  );

  const {
    ref,
    value: displayValue,
    isComplete,
    setValue,
    clear,
  } = useMaskedInput<FactoryOpts>({
    mask,
    value: toDisplay(value),
    disabled,
    onChange: handleChange,
    onComplete: handleComplete,
  });

  const setDate = useCallback(
    (date: Date | undefined) => setValue(toDisplay(date)),
    [setValue, toDisplay],
  );

  return { ref, displayValue, isComplete, setDate, clear };
};
