import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { RadioGroup, type RadioGroupProps } from "../../radio";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps, TextFieldValue } from "../types";
import { composeHandlers } from "./compose-handlers";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type RadioFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue>,
> = FormAdapterProps<TFormData, TName> &
  Omit<RadioGroupProps, ManagedControlProps>;

/**
 * @example
 * <RadioFormField<TForm> name="plan" label="Тариф">
 *   <Radio value="free" label="Free" />
 * </RadioFormField>
 */
export const RadioFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue> = FieldPathByValue<
    TFormData,
    TextFieldValue
  >,
>(
  props: RadioFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onValueChange, onBlur, ...radioProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, controlProps }) => (
        <RadioGroup
          {...radioProps}
          {...controlProps}
          ref={field.ref}
          value={field.value ?? ""}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onValueChange={composeHandlers(field.onChange, onValueChange)}
        />
      )}
    />
  );
};
