import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { NumberInput, type NumberInputProps } from "../../number-input";
import { FormField } from "../primitives/FormField";
import type { FloatingFormAdapterProps } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

/** Путь к числовому полю формы; пустое поле хранится как `null`. */
type NumberFieldValue = number | null | undefined;

export type NumberInputFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, NumberFieldValue>,
> = FloatingFormAdapterProps<TFormData, TName> &
  Omit<NumberInputProps, ManagedControlProps>;

/**
 * NumberInput, связанный с RHF: в форму пишется число или `null`. Для
 * необязательного поля схема — `optionalNumber(...)` из
 * `@shared/lib/validation`: `z.number().optional()` не примет `null`
 * очищенного поля.
 *
 * @example <NumberInputFormField<TForm> name="price" label="Цена" suffix="₽" min={0} />
 */
export const NumberInputFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, NumberFieldValue> =
    FieldPathByValue<TFormData, NumberFieldValue>,
>(
  props: NumberInputFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onValueChange, onBlur, variant, ...numberProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <NumberInput
          {...numberProps}
          {...controlProps}
          ref={field.ref}
          value={field.value ?? null}
          variant={resolveFieldVariant(variant, fieldState.invalid)}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onValueChange={composeHandlers(field.onChange, onValueChange)}
        />
      )}
    />
  );
};
