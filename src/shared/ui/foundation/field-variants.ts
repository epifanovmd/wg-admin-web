import { cva, type VariantProps } from "class-variance-authority";

import { CONTROL_HEIGHT } from "./control-size";

export const FIELD_BASE =
  "flex w-full grow min-w-0 rounded-lg px-3 py-2 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

export const FIELD_SIZE_TYPO = {
  sm: "text-sm px-2",
  md: "text-sm",
  lg: "text-base px-4",
} as const;

export const FIELD_SIZE_VARIANTS = {
  sm: `${CONTROL_HEIGHT.sm} ${FIELD_SIZE_TYPO.sm}`,
  md: `${CONTROL_HEIGHT.md} ${FIELD_SIZE_TYPO.md}`,
  lg: `${CONTROL_HEIGHT.lg} ${FIELD_SIZE_TYPO.lg}`,
} as const;

export const FIELD_VARIANT_MAP = {
  default: "border border-border bg-input-background",
  filled: "border-0 bg-muted",
  "filled-error": "border-0 bg-destructive/5 shadow-state-error",
  "filled-success": "border-0 bg-success/5 shadow-state-success",
  error: "border border-destructive bg-input-background",
  success: "border border-success bg-input-background",
} as const;

export const FIELD_FOCUS_MODE_VARIANTS = {
  self: "focus-visible:outline-none",
  within: "focus-within:outline-none",
  open: "focus-visible:outline-none data-[state=open]:outline-none",
} as const;

export const fieldVariants = cva(FIELD_BASE, {
  variants: {
    size: FIELD_SIZE_VARIANTS,
    variant: FIELD_VARIANT_MAP,
    focusMode: FIELD_FOCUS_MODE_VARIANTS,
  },
  defaultVariants: {
    size: "md",
    variant: "default",
    focusMode: "self",
  },
  compoundVariants: [
    {
      focusMode: "self",
      variant: "default",
      className: "focus-visible:shadow-focus",
    },
    {
      focusMode: "within",
      variant: "default",
      className: "focus-within:shadow-focus",
    },
    {
      focusMode: "open",
      variant: "default",
      className: "focus-visible:shadow-focus data-[state=open]:shadow-focus",
    },
    {
      focusMode: "self",
      variant: "filled",
      className: "focus-visible:bg-muted/70 focus-visible:shadow-focus",
    },
    {
      focusMode: "within",
      variant: "filled",
      className: "focus-within:bg-muted/70 focus-within:shadow-focus",
    },
    {
      focusMode: "open",
      variant: "filled",
      className:
        "focus-visible:bg-muted/70 focus-visible:shadow-focus data-[state=open]:bg-muted/70 data-[state=open]:shadow-focus",
    },
    {
      focusMode: "self",
      variant: ["error", "filled-error"],
      className: "focus-visible:shadow-focus-error",
    },
    {
      focusMode: "within",
      variant: ["error", "filled-error"],
      className: "focus-within:shadow-focus-error",
    },
    {
      focusMode: "open",
      variant: ["error", "filled-error"],
      className:
        "focus-visible:shadow-focus-error data-[state=open]:shadow-focus-error",
    },
    {
      focusMode: "self",
      variant: ["success", "filled-success"],
      className: "focus-visible:shadow-focus-success",
    },
    {
      focusMode: "within",
      variant: ["success", "filled-success"],
      className: "focus-within:shadow-focus-success",
    },
    {
      focusMode: "open",
      variant: ["success", "filled-success"],
      className:
        "focus-visible:shadow-focus-success data-[state=open]:shadow-focus-success",
    },
  ],
});

export type FieldVariantProps = Omit<
  VariantProps<typeof fieldVariants>,
  "focusMode"
>;
