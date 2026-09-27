import { cva } from "class-variance-authority";

export const emptyVariants = cva(
  "flex flex-col items-center justify-center px-4 text-center",
  {
    variants: {
      size: {
        sm: "gap-3 py-10",
        md: "gap-4 py-16",
        lg: "gap-5 py-24",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const emptyIconVariants = cva("text-muted-foreground/70", {
  variants: {
    size: {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-14 w-14",
    },
  },
  defaultVariants: {
    size: "md",
  },
});
