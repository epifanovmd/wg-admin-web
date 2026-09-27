import { cn } from "@shared/lib/utils";
import * as React from "react";
import { useFormContext, useFormState } from "react-hook-form";

export interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: React.ReactNode;
}

const ROOT_CLASS =
  "rounded-lg border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive";

/** Показывает переданное сообщение или корневую ошибку RHF (`errors.root`). */
export const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  ({ message, className, ...props }, ref) => {
    const { control } = useFormContext();
    const { errors } = useFormState({ control });
    const content = message ?? errors.root?.message;

    if (!content) return null;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(ROOT_CLASS, className)}
        {...props}
      >
        {content}
      </div>
    );
  },
);

FormError.displayName = "FormError";
