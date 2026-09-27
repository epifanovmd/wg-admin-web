import { useMergedRef } from "@mantine/hooks";
import {
  useControllableState,
  useSmoothHorizontalScroll,
} from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import * as React from "react";

import { useActiveIndicator } from "../foundation";
import {
  segmentedIndicatorVariants,
  segmentedVariants,
} from "./segmented-variants";
import { SegmentedItem, type SegmentedOption } from "./SegmentedItem";

export interface SegmentedProps<V extends string = string>
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    VariantProps<typeof segmentedVariants> {
  options: SegmentedOption<V>[];
  value?: V;
  /** Без `value` и `defaultValue` выбирается первая опция. */
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  disabled?: boolean;
}

const INDICATOR_TRANSITION = { duration: 0.2, ease: "easeInOut" } as const;
const INSTANT_TRANSITION = { duration: 0 } as const;

type KeyStep = 1 | -1 | "first" | "last";

const KEY_STEP: Record<string, KeyStep> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
  Home: "first",
  End: "last",
};

const nextEnabledIndex = <V extends string>(
  options: SegmentedOption<V>[],
  currentValue: V | undefined,
  step: KeyStep,
): number => {
  const enabled = options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => !option.disabled);

  if (enabled.length === 0) return -1;

  if (step === "first") return enabled[0]!.index;

  if (step === "last") return enabled[enabled.length - 1]!.index;

  const position = enabled.findIndex(
    ({ option }) => option.value === currentValue,
  );
  const start = position === -1 ? (step === 1 ? -1 : enabled.length) : position;

  return enabled[(start + step + enabled.length) % enabled.length]!.index;
};

const SegmentedInner = <V extends string = string>(
  {
    className,
    variant,
    size,
    fullWidth,
    options,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    ...props
  }: SegmentedProps<V>,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const [current, setCurrent] = useControllableState<V | undefined>({
    value,
    defaultValue: defaultValue ?? options[0]?.value,
    onChange: next => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const shouldReduceMotion = useReducedMotion();

  const innerRef = React.useRef<HTMLDivElement>(null);
  const { scrollToCenter } = useSmoothHorizontalScroll(innerRef);
  const { containerRef, rect, animated } = useActiveIndicator<HTMLDivElement>({
    activeSelector: '[data-active="true"]',
    value: current,
    itemsKey: options,
    onActiveChange: scrollToCenter,
  });
  const setRef = useMergedRef(ref, innerRef, containerRef);

  const selectedOption = options.find(option => option.value === current);
  const focusableValue =
    selectedOption && !selectedOption.disabled
      ? selectedOption.value
      : options.find(option => !option.disabled)?.value;

  const focusItem = (index: number) => {
    const items = innerRef.current?.querySelectorAll<HTMLButtonElement>(
      "[data-segmented-item]",
    );

    items?.[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = KEY_STEP[event.key];

    if (!step || disabled) return;

    event.preventDefault();

    const index = nextEnabledIndex(options, current, step);
    const next = options[index];

    if (!next) return;

    setCurrent(next.value);
    focusItem(index);
  };

  const transition =
    animated && !shouldReduceMotion ? INDICATOR_TRANSITION : INSTANT_TRANSITION;

  return (
    <div
      ref={setRef}
      role="radiogroup"
      aria-disabled={disabled || undefined}
      className={cn(segmentedVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {rect && (
        <motion.div
          aria-hidden
          data-slot="segmented-indicator"
          className={segmentedIndicatorVariants({ variant })}
          initial={false}
          animate={{
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          }}
          transition={transition}
        />
      )}
      {options.map(option => (
        <SegmentedItem<V>
          key={option.value}
          option={option}
          variant={variant}
          size={size}
          selected={current === option.value}
          disabled={disabled || Boolean(option.disabled)}
          focusable={option.value === focusableValue}
          onSelect={setCurrent}
          onKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
};

const SegmentedForwarded = React.forwardRef(SegmentedInner);

SegmentedForwarded.displayName = "Segmented";

/** Сегментированный переключатель; тип значения выводится из `options`. */
export const Segmented = SegmentedForwarded as <V extends string = string>(
  props: SegmentedProps<V> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
