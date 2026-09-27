import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "@shared/lib/utils";
import { joinIds } from "@shared/lib/utils/join-ids";
import type { VariantProps } from "class-variance-authority";
import { Check, Minus } from "lucide-react";
import * as React from "react";

import { ChoiceLabel } from "../foundation";
import { checkboxVariants } from "./checkbox-variants";

export interface CheckboxProps
  extends
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  indeterminate?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

type CheckboxSize = NonNullable<CheckboxProps["size"]>;

const CHECKBOX_ICON_SIZE: Record<CheckboxSize, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const INDICATOR_CLASS =
  "flex items-center justify-center text-current [&_svg]:stroke-[3]";

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(
  (
    {
      className,
      size,
      variant,
      indeterminate,
      label,
      description,
      id,
      checked,
      disabled,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const hasLabel = label !== undefined || description !== undefined;
    const checkboxId = id ?? generatedId;
    const descriptionId =
      description !== undefined ? `${checkboxId}-description` : undefined;
    const Icon = indeterminate ? Minus : Check;

    const control = (
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        disabled={disabled}
        aria-describedby={joinIds(ariaDescribedBy, descriptionId)}
        className={cn(checkboxVariants({ size, variant }), className)}
        {...props}
        checked={indeterminate ? "indeterminate" : checked}
      >
        <CheckboxPrimitive.Indicator className={INDICATOR_CLASS}>
          <Icon className={CHECKBOX_ICON_SIZE[size ?? "md"]} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!hasLabel) {
      return control;
    }

    return (
      <ChoiceLabel
        htmlFor={checkboxId}
        label={label}
        description={description}
        descriptionId={descriptionId}
        disabled={disabled}
      >
        {control}
      </ChoiceLabel>
    );
  },
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
