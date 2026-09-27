import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@shared/lib/utils";
import { joinIds } from "@shared/lib/utils/join-ids";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { ChoiceLabel } from "../foundation";
import { switchThumbVariants, switchVariants } from "./switch-variants";

export interface SwitchProps
  extends
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(
  (
    {
      className,
      size,
      variant,
      label,
      description,
      id,
      disabled,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const hasLabel = label !== undefined || description !== undefined;
    const switchId = id ?? generatedId;
    const descriptionId =
      description !== undefined ? `${switchId}-description` : undefined;

    const control = (
      <SwitchPrimitives.Root
        ref={ref}
        id={switchId}
        disabled={disabled}
        aria-describedby={joinIds(ariaDescribedBy, descriptionId)}
        className={cn(switchVariants({ size, variant }), className)}
        {...props}
      >
        <SwitchPrimitives.Thumb className={switchThumbVariants({ size })} />
      </SwitchPrimitives.Root>
    );

    if (!hasLabel) {
      return control;
    }

    return (
      <ChoiceLabel
        htmlFor={switchId}
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

Switch.displayName = "Switch";

export { Switch };
