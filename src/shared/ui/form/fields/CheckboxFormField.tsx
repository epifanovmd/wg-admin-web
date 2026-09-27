import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { Checkbox, type CheckboxProps } from "../../checkbox";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { buildRequiredLabel } from "./buildRequiredLabel";
import { composeHandlers } from "./compose-handlers";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type CheckboxFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, boolean | undefined>,
> = Omit<FormAdapterProps<TFormData, TName>, "hint"> &
  Omit<CheckboxProps, ManagedControlProps | "checked">;

/**
 * Checkbox, связанный с RHF. `label` и `description` рендерит сам Checkbox
 * (кликабельная подпись рядом с контролом), поэтому `hint` не поддерживается.
 *
 * @example <CheckboxFormField<TForm> name="accepted" label="Принимаю условия" />
 */
export const CheckboxFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, boolean | undefined> =
    FieldPathByValue<TFormData, boolean | undefined>,
>(
  props: CheckboxFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps: { label, description, ...formFieldProps },
    controlProps: { onCheckedChange, onBlur, variant, ...checkboxProps },
  } = splitFormAdapterProps(props);
  const controlLabel = buildRequiredLabel(label, formFieldProps.required);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <Checkbox
          {...checkboxProps}
          {...controlProps}
          ref={field.ref}
          label={controlLabel}
          description={description}
          checked={Boolean(field.value)}
          // У Checkbox нет filled-вариантов, поэтому resolveFieldVariant не нужен.
          variant={fieldState.invalid ? "error" : variant}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onCheckedChange={composeHandlers(
            (checked: CheckboxProps["checked"]) =>
              field.onChange(checked === true),
            onCheckedChange,
          )}
        />
      )}
    />
  );
};
