import type { FieldPath, FieldValues } from "react-hook-form";

import type { FloatingFormAdapterProps } from "../types";

/** Пропсы контрола, которыми владеет адаптер; потребитель их не задаёт. */
export type ManagedControlProps =
  "defaultValue" | "disabled" | "id" | "name" | "required" | "value";

type FormFieldPropKeys = keyof FloatingFormAdapterProps<
  FieldValues,
  FieldPath<FieldValues>
>;

export interface SplitFormAdapterProps<
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData>,
  TProps,
> {
  formFieldProps: FloatingFormAdapterProps<TFormData, TName>;
  controlProps: Omit<TProps, FormFieldPropKeys>;
}

/** Делит пропсы адаптера на пропсы FormField и пропсы самого контрола. */
export const splitFormAdapterProps = <
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData>,
  TProps extends FloatingFormAdapterProps<TFormData, TName>,
>(
  props: TProps & FloatingFormAdapterProps<TFormData, TName>,
): SplitFormAdapterProps<TFormData, TName, TProps> => {
  const {
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
    ...controlProps
  } = props;

  return {
    formFieldProps: {
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
    },
    controlProps,
  };
};
