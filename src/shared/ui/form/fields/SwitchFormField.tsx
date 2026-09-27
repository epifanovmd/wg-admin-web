import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { Switch, type SwitchProps } from "../../switch";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { buildRequiredLabel } from "./buildRequiredLabel";
import { composeHandlers } from "./compose-handlers";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type SwitchFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, boolean | undefined>,
> = Omit<FormAdapterProps<TFormData, TName>, "hint"> &
  Omit<SwitchProps, ManagedControlProps | "checked">;

/**
 * Switch, связанный с RHF. `label` и `description` рендерит сам Switch
 * (кликабельная подпись рядом с контролом), поэтому `hint` не поддерживается.
 *
 * @example <SwitchFormField<TForm> name="notifications" label="Уведомления" />
 */
export const SwitchFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, boolean | undefined> =
    FieldPathByValue<TFormData, boolean | undefined>,
>(
  props: SwitchFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps: { label, description, ...formFieldProps },
    controlProps: { onCheckedChange, onBlur, variant, ...switchProps },
  } = splitFormAdapterProps(props);
  const controlLabel = buildRequiredLabel(label, formFieldProps.required);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, fieldState, controlProps }) => (
        <Switch
          {...switchProps}
          {...controlProps}
          ref={field.ref}
          label={controlLabel}
          description={description}
          checked={Boolean(field.value)}
          // У Switch нет filled-вариантов, поэтому resolveFieldVariant не нужен.
          variant={fieldState.invalid ? "error" : variant}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onCheckedChange={composeHandlers(field.onChange, onCheckedChange)}
        />
      )}
    />
  );
};
