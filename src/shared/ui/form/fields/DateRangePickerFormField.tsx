import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import {
  type DateRange,
  DateRangePicker,
  type DateRangePickerProps,
} from "../../date-picker";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type DateRangePickerFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, DateRange | undefined>,
> = FormAdapterProps<TFormData, TName> &
  Omit<DateRangePickerProps, ManagedControlProps>;

/** @example <DateRangePickerFormField<TForm> name="period" label="Период" /> */
export const DateRangePickerFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, DateRange | undefined> =
    FieldPathByValue<TFormData, DateRange | undefined>,
>(
  props: DateRangePickerFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onChange, onBlur, variant, ...dateRangePickerProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <DateRangePicker
          {...dateRangePickerProps}
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
