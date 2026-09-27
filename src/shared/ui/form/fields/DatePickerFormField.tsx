import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { DatePicker, type DatePickerProps } from "../../date-picker";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type DatePickerFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, Date | undefined>,
> = FormAdapterProps<TFormData, TName> &
  Omit<DatePickerProps, ManagedControlProps>;

/** @example <DatePickerFormField<TForm> name="birthDate" label="Дата рождения" /> */
export const DatePickerFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, Date | undefined> =
    FieldPathByValue<TFormData, Date | undefined>,
>(
  props: DatePickerFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onChange, onBlur, variant, ...datePickerProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <DatePicker
          {...datePickerProps}
          {...controlProps}
          ref={field.ref}
          value={field.value}
          variant={resolveFieldVariant(variant, fieldState.invalid)}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onChange={composeHandlers(field.onChange, onChange)}
        />
      )}
    />
  );
};
