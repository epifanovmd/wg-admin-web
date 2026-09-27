import type { ReactElement } from "react";
import type { FieldPathByValue, FieldValues } from "react-hook-form";

import { Slider, type SliderProps, type SliderValue } from "../../slider";
import { FormField } from "../primitives/FormField";
import type { FormAdapterProps } from "../types";
import { composeHandlers } from "./compose-handlers";
import {
  type ManagedControlProps,
  splitFormAdapterProps,
} from "./split-form-adapter-props";

export type SliderFormFieldProps<
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, SliderValue>,
> = FormAdapterProps<TFormData, TName> &
  Omit<SliderProps<SliderValue>, ManagedControlProps>;

/**
 * Slider, связанный с RHF: число — одиночный, массив — диапазон (форма
 * значения берётся из значения поля).
 *
 * @example <SliderFormField<TForm> name="budget" label="Бюджет" max={1000} />
 */
export const SliderFormField = <
  TFormData extends FieldValues,
  TName extends FieldPathByValue<TFormData, SliderValue> = FieldPathByValue<
    TFormData,
    SliderValue
  >,
>(
  props: SliderFormFieldProps<TFormData, TName>,
): ReactElement => {
  const {
    formFieldProps,
    controlProps: { onValueChange, onBlur, ...sliderProps },
  } = splitFormAdapterProps(props);

  return (
    <FormField
      {...formFieldProps}
      render={({ field, controlProps }) => (
        <Slider<SliderValue>
          {...sliderProps}
          {...controlProps}
          ref={field.ref}
          value={field.value}
          onBlur={composeHandlers(field.onBlur, onBlur)}
          onValueChange={composeHandlers(field.onChange, onValueChange)}
        />
      )}
    />
  );
};
