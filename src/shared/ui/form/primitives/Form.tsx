import type { ReactElement } from "react";
import * as React from "react";
import {
  type FieldValues,
  FormProvider,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";

export interface FormProps<
  TFormData extends FieldValues,
  TContext = unknown,
  TOutput extends FieldValues = TFormData,
> extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onInvalid" | "onSubmit"
> {
  form: UseFormReturn<TFormData, TContext, TOutput>;
  onSubmit: SubmitHandler<TOutput>;
  onInvalid?: SubmitErrorHandler<TFormData>;
}

const FormInner = <
  TFormData extends FieldValues,
  TContext = unknown,
  TOutput extends FieldValues = TFormData,
>(
  {
    form,
    onSubmit,
    onInvalid,
    noValidate = true,
    children,
    ...props
  }: FormProps<TFormData, TContext, TOutput>,
  ref: React.ForwardedRef<HTMLFormElement>,
) => (
  <FormProvider {...form}>
    <form
      ref={ref}
      noValidate={noValidate}
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      {...props}
    >
      {children}
    </form>
  </FormProvider>
);

const FormComponent = React.forwardRef(FormInner);

FormComponent.displayName = "Form";

/**
 * Нативная форма с контекстом React Hook Form.
 *
 * @example
 * <Form form={form} onSubmit={save}>
 *   <InputFormField name="email" label="Email" />
 *   <FormSubmit>Сохранить</FormSubmit>
 * </Form>
 */
export const Form = FormComponent as <
  TFormData extends FieldValues,
  TContext = unknown,
  TOutput extends FieldValues = TFormData,
>(
  props: FormProps<TFormData, TContext, TOutput> & {
    ref?: React.Ref<HTMLFormElement>;
  },
) => ReactElement;
