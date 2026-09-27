import { joinIds } from "@shared/lib/utils/join-ids";
import type { ReactElement, ReactNode } from "react";
import * as React from "react";
import {
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";

import type { FloatingFormAdapterProps, FormFieldRenderProps } from "../types";
import { Field } from "./Field";

export interface FormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData> = FieldPath<TFormData>,
> extends FloatingFormAdapterProps<TFormData, TName> {
  render: (props: FormFieldRenderProps<TFormData, TName>) => ReactNode;
}

/**
 * Headless-поле RHF с общей подписью, ошибкой и ARIA-связками.
 *
 * `disabled` блокирует только контрол (через `controlProps.disabled`) и не
 * передаётся в `useController`: RHF иначе исключает значение из данных submit.
 *
 * @example
 * <FormField name="email" label="Email" render={({ field, controlProps }) => (
 *   <Input {...controlProps} {...field} />
 * )} />
 */
export const FormField = <
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData> = FieldPath<TFormData>,
>({
  name,
  control,
  rules,
  shouldUnregister,
  defaultValue,
  disabled,
  id,
  label,
  labelPlacement,
  hint,
  description,
  required,
  fieldClassName,
  render,
}: FormFieldProps<TFormData, TName>): ReactElement => {
  const generatedId = React.useId();
  const controlId = id ?? `${generatedId}-control`;
  const labelId = label !== undefined ? `${generatedId}-label` : undefined;
  const descriptionId =
    description !== undefined ? `${generatedId}-description` : undefined;
  const { field, fieldState, formState } = useController({
    name,
    control,
    rules,
    shouldUnregister,
    defaultValue,
  });
  const errorId = fieldState.error ? `${generatedId}-error` : undefined;
  const isDisabled = disabled || field.disabled || undefined;

  return (
    <Field
      label={label}
      labelPlacement={labelPlacement}
      hint={hint}
      description={description}
      descriptionId={descriptionId}
      error={fieldState.error?.message}
      errorId={errorId}
      required={required}
      htmlFor={controlId}
      labelId={labelId}
      className={fieldClassName}
    >
      {render({
        field,
        fieldState,
        formState,
        controlProps: {
          id: controlId,
          name: field.name,
          disabled: isDisabled,
          "aria-describedby": joinIds(descriptionId, errorId),
          "aria-invalid": fieldState.invalid || undefined,
          "aria-labelledby": labelId,
          "aria-required": required || undefined,
        },
      })}
    </Field>
  );
};
