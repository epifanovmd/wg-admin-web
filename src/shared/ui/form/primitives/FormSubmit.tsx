import * as React from "react";
import { useFormContext, useFormState } from "react-hook-form";

import { Button, type ButtonProps } from "../../button";

export interface FormSubmitProps extends Omit<ButtonProps, "type"> {
  /** Блокировать кнопку, пока форма невалидна (включает подписку на `isValid`). */
  disableWhenInvalid?: boolean;
}

/**
 * Кнопка submit ближайшей Form: отражает состояние отправки RHF.
 * `isValid` читается только при `disableWhenInvalid` — подписка на него
 * заставляет RHF прогонять resolver на каждое изменение формы.
 *
 * @example
 * <FormSubmit disableWhenInvalid>Сохранить</FormSubmit>
 */
export const FormSubmit = React.forwardRef<HTMLButtonElement, FormSubmitProps>(
  ({ disableWhenInvalid = false, disabled, loading, ...props }, ref) => {
    const { control } = useFormContext();
    const formState = useFormState({ control });
    const isInvalid = disableWhenInvalid && !formState.isValid;

    return (
      <Button
        {...props}
        ref={ref}
        type="submit"
        disabled={disabled || isInvalid}
        loading={loading || formState.isSubmitting}
      />
    );
  },
);

FormSubmit.displayName = "FormSubmit";
