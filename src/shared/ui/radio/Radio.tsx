import { joinIds } from "@shared/lib/utils/join-ids";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { ChoiceLabel } from "../foundation";
import { useRadioGroup } from "./radio-group-context";
import { radioDotVariants, radioVariants } from "./radio-variants";

export interface RadioProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "size" | "type" | "value"
    >,
    VariantProps<typeof radioVariants> {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

/**
 * Внутри `RadioGroup` пропсы `name`, `checked` и `onChange` берутся из
 * группы; переданные напрямую игнорируются.
 */
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      size,
      variant,
      value,
      label,
      description,
      id,
      disabled,
      checked,
      onChange,
      name,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const group = useRadioGroup();
    const generatedId = React.useId();
    const radioId = id ?? generatedId;
    const descriptionId =
      description !== undefined ? `${radioId}-description` : undefined;

    const resolvedSize = size ?? group?.size ?? "md";
    const resolvedVariant = variant ?? group?.variant ?? "default";
    const isDisabled = disabled ?? group?.disabled;

    const stateProps = group
      ? {
          name: group.name,
          checked: group.value === value,
          onChange: () => group.onChange(value),
        }
      : { name, checked, onChange };

    return (
      <ChoiceLabel
        htmlFor={radioId}
        label={label}
        description={description}
        descriptionId={descriptionId}
        disabled={isDisabled}
        className={className}
      >
        <span className="relative inline-flex shrink-0">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            value={value}
            disabled={isDisabled}
            aria-describedby={joinIds(ariaDescribedBy, descriptionId)}
            className="peer sr-only"
            {...stateProps}
            {...props}
          />
          <span
            className={radioVariants({
              size: resolvedSize,
              variant: resolvedVariant,
            })}
          />
          <span
            className={radioDotVariants({
              size: resolvedSize,
              variant: resolvedVariant,
            })}
          />
        </span>
      </ChoiceLabel>
    );
  },
);

Radio.displayName = "Radio";

export { Radio };
