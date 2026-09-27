import * as SliderPrimitive from "@radix-ui/react-slider";
import { useControllableState } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import {
  defaultThumbLabel,
  type SliderMark,
  type SliderValue,
  toValueArray,
} from "./slider-helpers";
import {
  type SliderOrientation,
  sliderRangeVariants,
  sliderRootVariants,
  sliderThumbVariants,
  sliderTrackVariants,
  type SliderVariantProps,
} from "./slider-variants";
import { SliderMarks } from "./SliderMarks";

type RootPrimitiveProps = React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
>;

export interface SliderProps<T extends SliderValue = number>
  extends
    Omit<
      RootPrimitiveProps,
      | "value"
      | "defaultValue"
      | "onValueChange"
      | "onValueCommit"
      | "orientation"
    >,
    SliderVariantProps {
  /** Число — одиночный слайдер, массив — диапазон (по ползунку на элемент). */
  value?: T;
  defaultValue?: T;
  /** Получает значение той же формы, что `value`: число или массив. */
  onValueChange?: (value: T) => void;
  /** Значение по окончании перетаскивания или шага с клавиатуры. */
  onValueCommit?: (value: T) => void;
  orientation?: SliderOrientation;
  /** Подпись со значением над ползунком (справа — у вертикального). */
  showValue?: boolean;
  /** Текст значения: подпись над ползунком и `aria-valuetext`. */
  formatValue?: (value: number) => string;
  /** Метки шкалы; подпись метки необязательна. */
  marks?: SliderMark[];
  /**
   * Доступное имя ползунка. По умолчанию «Значение», у диапазона —
   * «Минимум»/«Максимум»; одиночный ползунок берёт `aria-label`/`aria-labelledby`
   * самого слайдера, если они заданы.
   */
  getThumbLabel?: (index: number, count: number) => string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
}

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

const VALUE_LABEL_CLASS =
  "pointer-events-none absolute rounded-md bg-foreground px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-background";
const VALUE_LABEL_POSITION: Record<SliderOrientation, string> = {
  horizontal: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  vertical: "top-1/2 left-full ml-2 -translate-y-1/2",
};
const ROOT_SPACING = {
  valueHorizontal: "mt-7",
  marksHorizontal: "mb-6",
  marksVertical: "mr-10",
} as const;

const SliderInner = <T extends SliderValue = number>(
  {
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = DEFAULT_MIN,
    max = DEFAULT_MAX,
    step = 1,
    orientation = "horizontal",
    inverted = false,
    showValue = false,
    formatValue,
    marks,
    getThumbLabel,
    size,
    variant,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    "aria-required": ariaRequired,
    ...props
  }: SliderProps<T>,
  ref: React.ForwardedRef<HTMLSpanElement>,
) => {
  const isRange = Array.isArray(value ?? defaultValue);

  // Форма значения (число или массив) задаётся самим `T` через `isRange`.
  const fromArray = (next: number[]): T => (isRange ? next : next[0]) as T;

  const [values, setValues] = useControllableState<number[]>({
    value: value === undefined ? undefined : toValueArray(value, min),
    defaultValue: toValueArray(defaultValue, min),
    onChange: next => onValueChange?.(fromArray(next)),
  });

  const resolvedSize = size ?? "md";
  const isVertical = orientation === "vertical";
  const hasMarkLabels = marks?.some(mark => mark.label !== undefined) ?? false;
  const isLabelledByRoot =
    values.length === 1 &&
    !getThumbLabel &&
    Boolean(ariaLabel ?? ariaLabelledBy);

  const getThumbAriaProps = (index: number) =>
    isLabelledByRoot
      ? { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy }
      : {
          "aria-label": (getThumbLabel ?? defaultThumbLabel)(
            index,
            values.length,
          ),
        };

  return (
    <SliderPrimitive.Root
      ref={ref}
      role={
        isLabelledByRoot || !(ariaLabel ?? ariaLabelledBy) ? undefined : "group"
      }
      aria-label={isLabelledByRoot ? undefined : ariaLabel}
      aria-labelledby={isLabelledByRoot ? undefined : ariaLabelledBy}
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      inverted={inverted}
      className={cn(
        sliderRootVariants({ orientation, size }),
        showValue && !isVertical && ROOT_SPACING.valueHorizontal,
        hasMarkLabels && !isVertical && ROOT_SPACING.marksHorizontal,
        hasMarkLabels && isVertical && ROOT_SPACING.marksVertical,
        className,
      )}
      data-slot="slider"
      {...props}
      value={values}
      onValueChange={setValues}
      onValueCommit={next => onValueCommit?.(fromArray(next))}
    >
      <SliderPrimitive.Track
        className={sliderTrackVariants({ orientation, size })}
        data-slot="slider-track"
      >
        <SliderPrimitive.Range
          className={sliderRangeVariants({ orientation, variant })}
          data-slot="slider-range"
        />
      </SliderPrimitive.Track>
      {marks && marks.length > 0 && (
        <SliderMarks
          marks={marks}
          min={min}
          max={max}
          size={resolvedSize}
          orientation={orientation}
          inverted={inverted}
        />
      )}
      {values.map((thumbValue, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={sliderThumbVariants({ size, variant })}
          aria-valuetext={formatValue?.(thumbValue)}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          data-slot="slider-thumb"
          {...getThumbAriaProps(index)}
        >
          {showValue && (
            <span
              aria-hidden
              className={cn(
                VALUE_LABEL_CLASS,
                VALUE_LABEL_POSITION[orientation],
              )}
              data-slot="slider-value"
            >
              {formatValue?.(thumbValue) ?? thumbValue}
            </span>
          )}
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );
};

const SliderForwarded = React.forwardRef(SliderInner);

SliderForwarded.displayName = "Slider";

/**
 * Слайдер на Radix: одиночное значение или диапазон — форма `onValueChange`
 * совпадает с формой `value`/`defaultValue`.
 *
 * @example
 * <Slider defaultValue={[20, 80]} marks={[{ value: 50, label: "50" }]} />
 */
export const Slider = SliderForwarded as <T extends SliderValue = number>(
  props: SliderProps<T> & { ref?: React.Ref<HTMLSpanElement> },
) => React.ReactElement;
