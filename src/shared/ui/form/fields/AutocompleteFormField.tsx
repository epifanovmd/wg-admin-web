import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { Autocomplete, type AutocompleteProps } from "../../select";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps, TextFieldValue } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type AutocompleteFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue>,
> = FormAdapterProps<TFormData, TName> &
  Omit<AutocompleteProps, ManagedControlProps | "onChange"> & {
    onValueChange?: (value: string) => void;
  };

/**
 * Autocomplete, связанный с RHF. Контрол не принимает `name`, поэтому
 * атрибут в DOM не попадает — значение живёт только в состоянии формы.
 *
 * @example
 * <AutocompleteFormField<TForm> name="city" label="Город" options={options} />
 */
export const AutocompleteFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue> = FieldPathByValue<
    TFormData,
    TextFieldValue
  >,
>(
  props: AutocompleteFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: {
      onValueChange,
      onBlur,
      onOpenChange,
      variant,
      ...autocompleteProps
    },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({
        field,
        fieldState,
        controlProps: { name, ...controlProps },
      }) => (
        <Autocomplete
          {...autocompleteProps}
          {...controlProps}
          ref={field.ref}
          value={field.value ?? ""}
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
