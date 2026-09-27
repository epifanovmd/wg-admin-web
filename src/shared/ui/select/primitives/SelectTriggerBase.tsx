import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { FieldClearButton, isInvalidVariant } from "../../foundation";
import { selectTriggerVariants } from "../select-variants";
import { SelectTriggerIcon } from "./SelectTriggerIcon";

export interface SelectTriggerBaseProps
  extends
    VariantProps<typeof selectTriggerVariants>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "size"> {
  loading?: boolean;
  showClear?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  disabled?: boolean;
  cursorText?: boolean;
  hideChevron?: boolean;
}

const DISABLED_CLASS = "pointer-events-none opacity-50";

const noop = () => {};

/**
 * Оболочка поля-триггера: рамка `fieldVariants`, контент, иконка состояния
 * и кнопка очистки соседним элементом (не вложенный интерактив).
 */
export const SelectTriggerBase = React.forwardRef<
  HTMLDivElement,
  SelectTriggerBaseProps
>(
  (
    {
      className,
      size,
      variant,
      valid,
      loading,
      showClear,
      onClear,
      clearLabel,
      disabled,
      cursorText,
      hideChevron,
      children,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const isInvalid = valid === false || isInvalidVariant(variant);

    return (
      <div
        ref={ref}
        className={cn(
          selectTriggerVariants({ size, variant, valid }),
          cursorText ? "cursor-text" : "cursor-pointer",
          disabled && DISABLED_CLASS,
          className,
        )}
        aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
        aria-disabled={disabled || undefined}
        data-disabled={disabled ? "" : undefined}
        {...props}
      >
        {children}
        {showClear ? (
          <FieldClearButton onClear={onClear ?? noop} aria-label={clearLabel} />
        ) : (
          <SelectTriggerIcon loading={loading} hideChevron={hideChevron} />
        )}
      </div>
    );
  },
);

SelectTriggerBase.displayName = "SelectTriggerBase";
