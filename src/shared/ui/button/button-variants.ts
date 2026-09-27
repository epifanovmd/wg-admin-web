import { cva } from "class-variance-authority";

import { CONTROL_HEIGHT, INTENT_SOLID } from "../foundation";

const ELEVATED = "shadow-sm hover:shadow-md";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary: `${INTENT_SOLID.primary} hover:bg-primary/90 ${ELEVATED}`,
        secondary: `${INTENT_SOLID.secondary} hover:bg-secondary/80 hover:shadow-sm`,
        destructive: `${INTENT_SOLID.destructive} hover:bg-destructive/90 ${ELEVATED}`,
        success: `${INTENT_SOLID.success} hover:bg-success/90 ${ELEVATED}`,
        warning: `${INTENT_SOLID.warning} hover:bg-warning/90 ${ELEVATED}`,
        info: `${INTENT_SOLID.info} hover:bg-info/90 ${ELEVATED}`,
        outline:
          "border border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: `${CONTROL_HEIGHT.sm} px-3 text-sm`,
        md: `${CONTROL_HEIGHT.md} px-4 text-sm`,
        lg: `${CONTROL_HEIGHT.lg} px-6 text-base`,
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);
