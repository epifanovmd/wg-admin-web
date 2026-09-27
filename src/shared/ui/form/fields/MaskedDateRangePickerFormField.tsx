import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import {
  type DateRange,
  MaskedDateRangePicker,
  type MaskedDateRangePickerProps,
} from "../../date-picker";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type MaskedDateRangePickerFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, DateRange | undefined>,
> = FormAdapterProps<TFormData, TName> &
  Omit<MaskedDateRangePickerProps, ManagedControlProps>;

/** @example <MaskedDateRangePickerFormField<TForm> name="period" label="Период" /> */
export const MaskedDateRangePickerFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, DateRange | undefined> =
    FieldPathByValue<TFormData, DateRange | undefined>,
>(
  props: MaskedDateRangePickerFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onChange, onBlur, variant, ...pickerProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <MaskedDateRangePicker
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
