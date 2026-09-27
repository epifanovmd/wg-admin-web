import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { Select, type SelectProps, type SelectValue } from "../../select";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

type ManagedSelectProps =
  ManagedControlProps | "clearable" | "labelInValue" | "multi" | "onChange";

export type SelectFormFieldProps<
  TFormData extends FieldValues,
  TValue extends SelectValue,
  TName extends FieldPathByValue<TFormData, TValue | null | undefined>,
> = FormAdapterProps<TFormData, TName> &
  Omit<SelectProps<TValue>, ManagedSelectProps> & {
    /** Кнопка очистки (по умолчанию включена); `false` для обязательных полей. */
    clearable?: boolean;
    onValueChange?: (value: TValue | null) => void;
  };

/** Подбирает ветку union-пропсов Select: `null` допустим только с кнопкой очистки. */
const getSingleValueProps = <TValue extends SelectValue>(
  clearable: boolean,
  value: TValue | null | undefined,
) =>
  clearable
    ? { clearable: true as const, value: value ?? null }
    : { clearable: false as const, value: value ?? undefined };

/**
 * Типобезопасный одиночный Select. Для массивов — MultiSelectFormField.
 *
 * @example
 * <SelectFormField<TForm> name="country" label="Страна" options={options} />
 */
export const SelectFormField = <
  TFormData extends FieldValues,
  TValue extends SelectValue = string,
  TName extends FieldPathByValue<TFormData, TValue | null | undefined> =
    FieldPathByValue<TFormData, TValue | null | undefined>,
>(
  props: SelectFormFieldProps<TFormData, TValue, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: {
      clearable = true,
      onValueChange,
      onBlur,
      onOpenChange,
      variant,
      ...selectProps
    },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <Select<TValue>
          {...selectProps}
          {...controlProps}
          {...getSingleValueProps<TValue>(clearable, field.value)}
          ref={field.ref}
          multi={false}
          labelInValue={false}
          variant={resolveFieldVariant(variant, fieldState.invalid)}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onOpenChange={composeHandlers((open: boolean) => {
            if (!open) field.onBlur();
          }, onOpenChange)}
          onChange={composeHandlers(field.onChange, onValueChange)}
        />
      )}
    />
  );
};
