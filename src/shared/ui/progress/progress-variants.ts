import { cva } from "class-variance-authority";

export const progressTrackVariants = cva(
  "w-full overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const progressBarVariants = cva(
  "h-full rounded-full transition-[width] duration-300",
  {
    variants: {
      variant: {
        primary: "bg-primary",
        success: "bg-success",
        destructive: "bg-destructive",
      },
      indeterminate: {
        true: "w-1/3 animate-[progress-indeterminate_1.2s_linear_infinite]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      indeterminate: false,
    },
  },
);
