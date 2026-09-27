import { cva } from "class-variance-authority";

import { INTERACTION } from "../foundation";

export const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-md",
        outline: "border-2",
      },
      /** Эффект наведения для кликабельной карточки. */
      interactive: INTERACTION,
    },
    defaultVariants: {
      variant: "default",
      interactive: "none",
    },
  },
);
