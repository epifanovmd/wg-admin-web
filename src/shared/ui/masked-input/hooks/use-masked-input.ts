import { useLatestRef } from "@shared/lib/hooks";
import type { FactoryOpts, InputMask } from "imask";
import { type RefObject, useEffect, useRef } from "react";
import { useIMask } from "react-imask";

export interface MaskedInputChangeInfo<Opts extends FactoryOpts> {
  value: string;
  unmaskedValue: string;
  typedValue: InputMask<Opts>["typedValue"];
  isComplete: boolean;
  /** Событие ввода; отсутствует при программной установке значения. */
  event?: InputEvent;
}

export type MaskedValueMode = "masked" | "unmasked";

export interface UseMaskedInputOptions<Opts extends FactoryOpts> {
  /** Опции imask; должны быть стабильны по identity (`useMemo`/константа). */
  mask: Opts;
  /** Внешнее значение в форме `valueMode` (по умолчанию — masked). */
  value?: string;
  /** В какой форме сравнивать и применять `value`. */
  valueMode?: MaskedValueMode;
  disabled?: boolean;
  onChange?: (info: MaskedInputChangeInfo<Opts>) => void;
  onComplete?: (info: MaskedInputChangeInfo<Opts>) => void;
}

export interface UseMaskedInputResult<Opts extends FactoryOpts> {
  ref: RefObject<HTMLInputElement | null>;
  value: string;
  unmaskedValue: string;
  typedValue: InputMask<Opts>["typedValue"];
  isComplete: boolean;
  setValue: (value: string) => void;
  setUnmaskedValue: (value: string) => void;
  clear: () => void;
}

interface EmittedValues {
  masked: string;
  unmasked: string;
}

const buildChangeInfo = <Opts extends FactoryOpts>(
  maskInstance: InputMask<Opts>,
  event?: InputEvent,
): MaskedInputChangeInfo<Opts> => ({
  value: maskInstance.value,
  unmaskedValue: maskInstance.unmaskedValue,
  typedValue: maskInstance.typedValue,
  isComplete: maskInstance.masked.isComplete,
  event,
});

/**
 * Обёртка над `useIMask`: колбэки через latest-ref (опции imask стабильны),
 * контролируемое значение в masked/unmasked форме без повторного `onChange`
 * на собственное же значение.
 */
export const useMaskedInput = <Opts extends FactoryOpts>({
  mask,
  value: externalValue,
  valueMode = "masked",
  disabled,
  onChange,
  onComplete,
}: UseMaskedInputOptions<Opts>): UseMaskedInputResult<Opts> => {
  const lastEmittedRef = useRef<EmittedValues | null>(null);

  const imaskOptions = useRef({
    defaultValue: valueMode === "masked" ? externalValue : undefined,
    defaultUnmaskedValue: valueMode === "unmasked" ? externalValue : undefined,
    _onChange: onChange,
    _onComplete: onComplete,
    onAccept: (_: unknown, m: InputMask<Opts>, event?: InputEvent) => {
      lastEmittedRef.current = { masked: m.value, unmasked: m.unmaskedValue };
      imaskOptions._onChange?.(buildChangeInfo(m, event));
    },
    onComplete: (_: unknown, m: InputMask<Opts>, event?: InputEvent) =>
      imaskOptions._onComplete?.(buildChangeInfo(m, event)),
  }).current;

  imaskOptions._onChange = onChange;
  imaskOptions._onComplete = onComplete;

  const {
    ref,
    maskRef,
    value: maskedValue,
    unmaskedValue,
    typedValue,
    setValue,
    setUnmaskedValue,
  } = useIMask<HTMLInputElement, Opts>(mask, imaskOptions);

  const currentValue = valueMode === "masked" ? maskedValue : unmaskedValue;
  const currentValueRef = useLatestRef(currentValue);

  // Внешнее значение пишется прямо в экземпляр маски: сеттеры react-imask
  // сверяются с собственным кэшем и в режиме unmasked могут пропустить
  // сброс. imask сам генерирует `accept`, и состояние хука обновляется.
  const applyValueRef = useLatestRef((next: string) => {
    const instance = maskRef.current;

    if (!instance) return;

    if (valueMode === "masked") {
      instance.value = next;
    } else {
      instance.unmaskedValue = next;
    }
  });

  // Синхронизация только при смене внешнего значения: незавершённый ввод
  // пользователя (пока родитель не получил onChange) не перетирается, а
  // значение, которое мы сами отдали в onChange, не прогоняется через imask
  // повторно (иначе сдвигается курсор).
  useEffect(() => {
    if (externalValue === undefined) return;
    if (
      externalValue === currentValueRef.current ||
      externalValue === lastEmittedRef.current?.[valueMode]
    ) {
      return;
    }

    applyValueRef.current(externalValue);
  }, [externalValue, valueMode, currentValueRef, applyValueRef]);

  useEffect(() => {
    if (ref.current) ref.current.disabled = !!disabled;
  }, [disabled, ref]);

  return {
    ref,
    value: maskedValue as string,
    unmaskedValue: unmaskedValue as string,
    typedValue,
    isComplete: !!maskRef.current?.masked.isComplete,
    setValue: setValue as (v: string) => void,
    setUnmaskedValue: setUnmaskedValue as (v: string) => void,
    clear: () => setValue(""),
  };
};
