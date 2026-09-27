import { cva } from "class-variance-authority";

export const radioVariants = cva(
  [
    "block shrink-0 rounded-full border bg-background transition-all duration-200",
    "peer-focus-visible:outline-none",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
      variant: {
        default:
          "border-border peer-checked:border-primary peer-focus-visible:shadow-focus-offset",
        error:
          "border-destructive peer-checked:border-destructive peer-focus-visible:shadow-focus-error-offset",
        success:
          "border-success peer-checked:border-success peer-focus-visible:shadow-focus-success-offset",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

export const radioDotVariants = cva(
  "pointer-events-none absolute inset-0 m-auto rounded-full scale-0 transition-transform duration-200 peer-checked:scale-100",
  {
    variants: {
      size: {
        sm: "h-1.5 w-1.5",
        md: "h-2 w-2",
        lg: "h-2.5 w-2.5",
      },
      variant: {
        default: "bg-primary",
        error: "bg-destructive",
        success: "bg-success",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);
