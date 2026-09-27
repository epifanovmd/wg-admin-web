import { cva } from "class-variance-authority";

import { type Intent, INTENT_OUTLINE, INTENT_SOLID } from "../foundation";

const INTENTS: Intent[] = [
  "primary",
  "secondary",
  "destructive",
  "success",
  "warning",
  "info",
];

/** Активный чип — залитый, неактивный — контурный; обе карты из foundation. */
const intentCompoundVariants = INTENTS.flatMap(intent => [
  {
    variant: intent,
    active: true,
    className: `${INTENT_SOLID[intent]} hover:opacity-90`,
  },
  { variant: intent, active: false, className: INTENT_OUTLINE[intent] },
]);

export const chipVariants = cva(
  "inline-flex max-w-full items-center gap-1.5 rounded-full font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "",
        primary: "",
        secondary: "",
        destructive: "",
        success: "",
        warning: "",
        info: "",
        outline: "",
        muted: "",
      },
      active: {
        true: "",
        false: "",
      },
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
      },
      disabled: {
        true: "cursor-not-allowed opacity-50",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        active: true,
        className: `${INTENT_SOLID.secondary} hover:opacity-90`,
      },
      {
        variant: "default",
        active: false,
        className: INTENT_OUTLINE.secondary,
      },
      ...intentCompoundVariants,
      {
        variant: "outline",
        active: true,
        className:
          "border border-foreground/30 bg-background text-foreground hover:bg-accent",
      },
      {
        variant: "outline",
        active: false,
        className:
          "border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
      },
      {
        variant: "muted",
        active: true,
        className: "bg-muted text-muted-foreground hover:bg-muted/80",
      },
      {
        variant: "muted",
        active: false,
        className: "bg-muted/50 text-muted-foreground hover:bg-muted/80",
      },
    ],
    defaultVariants: {
      variant: "default",
      active: true,
      size: "md",
      disabled: false,
    },
  },
);
