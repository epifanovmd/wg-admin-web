import type { ReactElement } from "react";
import {
  type FieldPathByValue,
  type FieldValues,
  useWatch,
} from "react-hook-form";

import { Segmented, type SegmentedProps } from "../../segmented";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps, TextFieldValue } from "../types";
import { composeHandlers } from "./compose-handlers";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type SegmentedFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue>,
> = FormAdapterProps<TFormData, TName> &
  Omit<SegmentedProps, ManagedControlProps>;

/**
 * Описание под полем — `description` поля, иначе описание выбранного варианта.
 * @example <SegmentedFormField<TForm> name="view" label="Вид" options={options} />
 */
export const SegmentedFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, TextFieldValue> = FieldPathByValue<
    TFormData,
    TextFieldValue
  >,
>(
  props: SegmentedFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onValueChange, onBlur, ...segmentedProps },
  } = splitFormAdapterProps(props);
  const selected = useWatch({
    control: formFieldProps.control,
    name: formFieldProps.name,
  });
  const description =
    formFieldProps.description ??
    segmentedProps.options.find(option => option.value === selected)
      ?.description;

  return (
    <FormField
      {...formFieldProps}
      description={description}
      render={({ field, controlProps }) => (
        <Segmented
          {...segmentedProps}
          {...controlProps}
          ref={field.ref}
          value={field.value ?? ""}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onValueChange={composeHandlers(field.onChange, onValueChange)}
        />
      )}
    />
  );
};
