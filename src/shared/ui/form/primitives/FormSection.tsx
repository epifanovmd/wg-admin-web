import { cn } from "@shared/lib/utils";
import { joinIds } from "@shared/lib/utils/join-ids";
import * as React from "react";

export interface FormSectionProps extends Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "title"
> {
  title?: React.ReactNode;
  description?: React.ReactNode;
}

const ROOT_CLASS = "flex min-w-0 flex-col gap-4";
const TITLE_CLASS = "text-sm font-semibold text-foreground";
const DESCRIPTION_CLASS = "-mt-2 text-xs text-muted-foreground";

/** Доступная группа связанных контролов формы: описание связано через `aria-describedby`. */
export const FormSection = React.forwardRef<
  HTMLFieldSetElement,
  FormSectionProps
>(
  (
    {
      title,
      description,
      className,
      children,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const descriptionId =
      description !== undefined ? `${generatedId}-description` : undefined;

    return (
      <fieldset
        ref={ref}
        className={cn(ROOT_CLASS, className)}
        aria-describedby={joinIds(ariaDescribedBy, descriptionId)}
        {...props}
      >
        {title !== undefined && (
          <legend className={TITLE_CLASS}>{title}</legend>
        )}
        {description !== undefined && (
          <p id={descriptionId} className={DESCRIPTION_CLASS}>
            {description}
          </p>
        )}
        {children}
      </fieldset>
    );
  },
);

FormSection.displayName = "FormSection";
