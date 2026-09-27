import { cva } from "class-variance-authority";

import { CONTROL_HEIGHT } from "../foundation";

export const segmentedVariants = cva(
  "relative flex items-center gap-1 rounded-lg p-1 transition-colors overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
  {
    variants: {
      variant: {
        default: "bg-muted",
        primary: "bg-primary/10",
        secondary: "bg-secondary/10",
        outline: "border border-border bg-transparent",
      },
      size: {
        sm: `${CONTROL_HEIGHT.sm} text-xs`,
        md: `${CONTROL_HEIGHT.md} text-sm`,
        lg: `${CONTROL_HEIGHT.lg} text-base`,
      },
      /** Растянуть на ширину контейнера; по умолчанию — по содержимому. */
      fullWidth: {
        true: "w-full",
        false: "w-fit max-w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  },
);

export const segmentedItemVariants = cva(
  "relative z-10 inline-flex flex-auto shrink-0 items-center justify-center whitespace-nowrap rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
        secondary: "",
        outline: "",
      },
      size: {
        sm: "h-6 px-2.5 text-xs min-w-[60px]",
        md: "h-8 px-3 text-sm min-w-[80px]",
        lg: "h-10 px-4 text-base min-w-[100px]",
      },
      active: {
        true: "",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    compoundVariants: [
      {
        variant: ["default", "outline"],
        active: true,
        className: "text-foreground",
      },
      {
        variant: "primary",
        active: true,
        className: "text-primary-foreground",
      },
      {
        variant: "secondary",
        active: true,
        className: "text-secondary-foreground",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      active: false,
    },
  },
);

export const segmentedIndicatorVariants = cva(
  "absolute top-0 left-0 z-0 rounded-md shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-background",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "bg-background border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
