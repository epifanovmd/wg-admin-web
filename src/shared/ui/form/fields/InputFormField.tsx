import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { Input, type InputProps } from "../../input";
import { FormField } from "../primitives/FormField";
import type { FloatingFormAdapterProps, TextFieldValue } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type InputFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue>,
> = FloatingFormAdapterProps<TFormData, TName> &
  Omit<InputProps, ManagedControlProps>;

/**
 * Строковый Input, связанный с RHF.
 *
 * @example
 * <InputFormField<TForm>
 *   name="email"
 *   label="Email"
 *   labelPlacement="floating"
 *   placeholder="name@example.com"
 * />
 */
export const InputFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue> = FieldPathByValue<
    TFormData,
    TextFieldValue
  >,
>(
  props: InputFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onChange, onBlur, onClear, variant, ...inputProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <Input
          {...inputProps}
          {...controlProps}
          ref={field.ref}
          value={field.value ?? ""}
          variant={resolveFieldVariant(variant, fieldState.invalid)}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onChange={composeHandlers(field.onChange, onChange)}
          onClear={composeHandlers(() => field.onChange(""), onClear)}
        />
      )}
    />
  );
};
