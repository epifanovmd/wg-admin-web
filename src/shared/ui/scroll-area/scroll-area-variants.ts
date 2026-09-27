import { cva } from "class-variance-authority";

export const scrollBarVariants = cva(
  "flex touch-none select-none p-px transition-colors",
  {
    variants: {
      orientation: {
        vertical: "h-full w-2.5 border-l border-l-transparent",
        horizontal: "h-2.5 flex-col border-t border-t-transparent",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);
