import type { FactoryOpts } from "imask";
import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import {
  MaskedInput,
  type MaskedInputChangeInfo,
  type MaskedInputProps,
} from "../../masked-input";
import { FormField } from "../primitives/FormField";
import type { FloatingFormAdapterProps, TextFieldValue } from "../types";
import { composeHandlers } from "./compose-handlers";
import { resolveFieldVariant } from "./resolve-field-variant";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type MaskedInputFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue>,
  TMask extends FactoryOpts,
> = FloatingFormAdapterProps<TFormData, TName> &
  Omit<MaskedInputProps<TMask>, ManagedControlProps>;

/**
 * Маскированный ввод, связанный с RHF. В форму записывается `unmaskedValue`
 * (только значимые символы без разделителей маски); `defaultValues` формы
 * тоже задаются в unmasked-виде.
 *
 * @example
 * <MaskedInputFormField<TForm> name="phone" label="Телефон" mask={phoneMask} />
 */
export const MaskedInputFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue> = FieldPathByValue<
    TFormData,
    TextFieldValue
  >,
  TMask extends FactoryOpts = FactoryOpts,
>(
  props: MaskedInputFormFieldProps<TFormData, TName, TMask>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onChange, onBlur, onClear, variant, ...maskedInputProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <MaskedInput<TMask>
          {...maskedInputProps}
          {...controlProps}
          ref={field.ref}
          value={field.value ?? ""}
          variant={resolveFieldVariant(variant, fieldState.invalid)}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onChange={composeHandlers(
            (info: MaskedInputChangeInfo<TMask>) =>
              field.onChange(info.unmaskedValue),
            onChange,
          )}
          onClear={composeHandlers(() => field.onChange(""), onClear)}
        />
      )}
    />
  );
};
