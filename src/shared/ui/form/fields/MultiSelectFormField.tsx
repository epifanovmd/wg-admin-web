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
  ManagedControlProps | "labelInValue" | "multi" | "onChange";

export type MultiSelectFormFieldProps<
  TFormData extends FieldValues,
  TValue extends SelectValue,
  TName extends FieldPathByValue<TFormData, TValue[] | undefined>,
> = FormAdapterProps<TFormData, TName> &
  Omit<SelectProps<TValue>, ManagedSelectProps> & {
    onValueChange?: (value: TValue[]) => void;
  };

/** @example <MultiSelectFormField<TForm> name="roles" label="Роли" options={options} /> */
export const MultiSelectFormField = <
  TFormData extends FieldValues,
  TValue extends SelectValue = string,
  TName extends FieldPathByValue<TFormData, TValue[] | undefined> =
    FieldPathByValue<TFormData, TValue[] | undefined>,
>(
  props: MultiSelectFormFieldProps<TFormData, TValue, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: {
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
          ref={field.ref}
          multi
          labelInValue={false}
          value={(field.value ?? []) as TValue[]}
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
