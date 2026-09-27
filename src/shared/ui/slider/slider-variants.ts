import { cva, type VariantProps } from "class-variance-authority";

export const sliderRootVariants = cva(
  "relative flex cursor-pointer touch-none items-center select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
  {
    variants: {
      orientation: {
        horizontal: "w-full",
        vertical: "h-full min-h-32 flex-col justify-center",
      },
      size: { sm: "", md: "" },
    },
    compoundVariants: [
      { orientation: "horizontal", size: "sm", className: "h-4" },
      { orientation: "horizontal", size: "md", className: "h-5" },
      { orientation: "vertical", size: "sm", className: "w-4" },
      { orientation: "vertical", size: "md", className: "w-5" },
    ],
    defaultVariants: { orientation: "horizontal", size: "md" },
  },
);

export const sliderTrackVariants = cva(
  "relative grow overflow-hidden rounded-full bg-muted",
  {
    variants: {
      orientation: { horizontal: "w-full", vertical: "h-full" },
      size: { sm: "", md: "" },
    },
    compoundVariants: [
      { orientation: "horizontal", size: "sm", className: "h-1" },
      { orientation: "horizontal", size: "md", className: "h-1.5" },
      { orientation: "vertical", size: "sm", className: "w-1" },
      { orientation: "vertical", size: "md", className: "w-1.5" },
    ],
    defaultVariants: { orientation: "horizontal", size: "md" },
  },
);

const SLIDER_INTENT = {
  primary: "bg-primary",
  success: "bg-success",
  destructive: "bg-destructive",
  warning: "bg-warning",
  info: "bg-info",
} as const;

export const sliderRangeVariants = cva("absolute rounded-full", {
  variants: {
    orientation: { horizontal: "h-full", vertical: "w-full" },
    variant: SLIDER_INTENT,
  },
  defaultVariants: { orientation: "horizontal", variant: "primary" },
});

export const sliderThumbVariants = cva(
  "relative block cursor-grab rounded-full border-2 bg-background shadow-sm transition-shadow outline-none focus-visible:ring-4 active:cursor-grabbing data-[disabled]:pointer-events-none",
  {
    variants: {
      size: { sm: "size-3.5", md: "size-4.5" },
      variant: {
        primary: "border-primary focus-visible:ring-primary/25",
        success: "border-success focus-visible:ring-success/25",
        destructive: "border-destructive focus-visible:ring-destructive/25",
        warning: "border-warning focus-visible:ring-warning/25",
        info: "border-info focus-visible:ring-info/25",
      },
    },
    defaultVariants: { size: "md", variant: "primary" },
  },
);

/** Диаметр ползунка в px — для выравнивания меток с центром ползунка. */
export const SLIDER_THUMB_SIZE_PX = { sm: 14, md: 18 } as const;

export type SliderSize = keyof typeof SLIDER_THUMB_SIZE_PX;
export type SliderOrientation = "horizontal" | "vertical";

export type SliderVariantProps = VariantProps<typeof sliderThumbVariants>;
