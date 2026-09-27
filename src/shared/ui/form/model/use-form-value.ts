import {
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";

/** Подписывается на одно значение формы, обычно на дискриминатор схемы. */
export const useFormValue = <
  TFormData extends FieldValues,
  TName extends FieldPath<TFormData>,
>(
  name: TName,
): FieldPathValue<TFormData, TName> => {
  const { control } = useFormContext<TFormData>();

  return useWatch({ control, name, exact: true });
};
