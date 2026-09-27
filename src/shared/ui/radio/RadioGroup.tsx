import { useControllableState } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  RadioGroupContext,
  type RadioGroupContextValue,
  type RadioSize,
  type RadioVariant,
} from "./radio-group-context";

export interface RadioGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  size?: RadioSize;
  variant?: RadioVariant;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
}

const ORIENTATION_CLASS: Record<
  NonNullable<RadioGroupProps["orientation"]>,
  string
> = {
  vertical: "flex-col gap-2.5",
  horizontal: "flex-row flex-wrap gap-4",
};

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      name,
      size,
      variant,
      disabled,
      orientation = "vertical",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const generatedName = React.useId();
    const [current, setCurrent] = useControllableState<string | undefined>({
      value,
      defaultValue,
      onChange: next => {
        if (next !== undefined) onValueChange?.(next);
      },
    });

    const ctx = React.useMemo<RadioGroupContextValue>(
      () => ({
        name: name ?? generatedName,
        value: current,
        onChange: setCurrent,
        size,
        variant,
        disabled,
      }),
      [name, generatedName, current, setCurrent, size, variant, disabled],
    );

    return (
      <RadioGroupContext.Provider value={ctx}>
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          className={cn("flex", ORIENTATION_CLASS[orientation], className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroup.displayName = "RadioGroup";

export { RadioGroup };
