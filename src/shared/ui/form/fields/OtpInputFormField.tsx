import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { OtpInput, type OtpInputProps } from "../../otp-input";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps, TextFieldValue } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type OtpInputFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue>,
> = FormAdapterProps<TFormData, TName> &
  Omit<OtpInputProps, ManagedControlProps>;

/** @example <OtpInputFormField<TForm> name="code" label="Код из SMS" length={6} /> */
export const OtpInputFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue> = FieldPathByValue<
    TFormData,
    TextFieldValue
  >,
>(
  props: OtpInputFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onValueChange, onBlur, variant, ...otpProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <OtpInput
          {...otpProps}
          {...controlProps}
          ref={field.ref}
          value={field.value ?? ""}
          variant={resolveFieldVariant(variant, fieldState.invalid)}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onValueChange={composeHandlers(field.onChange, onValueChange)}
        />
      )}
    />
  );
};
