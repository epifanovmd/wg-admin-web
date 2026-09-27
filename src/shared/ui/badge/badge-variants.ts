import { cva } from "class-variance-authority";

import { INTENT_SOFT, INTENT_SOLID } from "../foundation";

export const badgeVariants = cva(
  "inline-flex h-5 min-w-5 max-w-full items-center justify-center gap-1.5 overflow-hidden rounded-full px-2 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default: INTENT_SOLID.secondary,
        primary: INTENT_SOLID.primary,
        secondary: INTENT_SOLID.secondary,
        destructive: INTENT_SOFT.destructive,
        purple: INTENT_SOFT.purple,
        success: INTENT_SOFT.success,
        warning: INTENT_SOFT.warning,
        info: INTENT_SOFT.info,
        outline: "border border-border bg-background text-foreground",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
