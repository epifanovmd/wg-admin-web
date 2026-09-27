import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import {
  MaskedDatePicker,
  type MaskedDatePickerProps,
} from "../../date-picker";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type MaskedDatePickerFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, Date | undefined>,
> = FormAdapterProps<TFormData, TName> &
  Omit<MaskedDatePickerProps, ManagedControlProps>;

/** @example <MaskedDatePickerFormField<TForm> name="date" label="Дата" /> */
export const MaskedDatePickerFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, Date | undefined> =
    FieldPathByValue<TFormData, Date | undefined>,
>(
  props: MaskedDatePickerFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onChange, onBlur, variant, ...pickerProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <MaskedDatePicker
          {...pickerProps}
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
