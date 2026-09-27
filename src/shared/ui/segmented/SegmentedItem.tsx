import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { segmentedItemVariants } from "./segmented-variants";

export interface SegmentedOption<V extends string = string> {
  label: React.ReactNode;
  value: V;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedItemProps<V extends string = string> extends Pick<
  VariantProps<typeof segmentedItemVariants>,
  "variant" | "size"
> {
  option: SegmentedOption<V>;
  selected: boolean;
  disabled: boolean;
  /** Roving tabindex: в Tab-порядке только один элемент группы. */
  focusable: boolean;
  onSelect: (value: V) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLButtonElement>;
}

export const SegmentedItem = <V extends string>({
  option,
  selected,
  disabled,
  focusable,
  variant,
  size,
  onSelect,
  onKeyDown,
}: SegmentedItemProps<V>) => {
  const handleClick = () => onSelect(option.value);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={focusable ? 0 : -1}
      disabled={disabled}
      data-active={selected}
      data-segmented-item
      className={segmentedItemVariants({ variant, size, active: selected })}
      onClick={handleClick}
      onKeyDown={onKeyDown}
    >
      <span className="relative z-10 inline-flex items-center">
        {option.icon && (
          <span className="mr-1.5 inline-flex items-center">{option.icon}</span>
        )}
        {option.label}
      </span>
    </button>
  );
};
