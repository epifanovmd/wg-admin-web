import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { TimePicker, type TimePickerProps } from "../../date-picker";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type TimePickerFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, Date | undefined>,
> = FormAdapterProps<TFormData, TName> &
  Omit<TimePickerProps, ManagedControlProps>;

/** @example <TimePickerFormField<TForm> name="startsAt" label="Время начала" step={15} /> */
export const TimePickerFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, Date | undefined> =
    FieldPathByValue<TFormData, Date | undefined>,
>(
  props: TimePickerFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onChange, onBlur, variant, ...pickerProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <TimePicker
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
