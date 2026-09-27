import { cn } from "@shared/lib/utils";

import { type FieldVariantProps, fieldVariants } from "../../foundation";

export type DatePickerTriggerVariantProps = FieldVariantProps;

type FieldVariant = NonNullable<FieldVariantProps["variant"]>;

/** Подсветка открытого попапа повторяет фокусное кольцо варианта поля. */
const OPEN_SHADOW: Record<FieldVariant, string> = {
  default: "data-[state=open]:shadow-focus",
  filled: "data-[state=open]:bg-muted/70 data-[state=open]:shadow-focus",
  error: "data-[state=open]:shadow-focus-error",
  "filled-error": "data-[state=open]:shadow-focus-error",
  success: "data-[state=open]:shadow-focus-success",
  "filled-success": "data-[state=open]:shadow-focus-success",
};

/**
 * Оболочка триггера пикера: рамка поля, подсветка при фокусе внутри и в
 * открытом состоянии (`data-state=open` ставит пикер).
 */
export const datePickerTriggerVariants = ({
  size,
  variant,
}: DatePickerTriggerVariantProps = {}) =>
  cn(
    fieldVariants({ focusMode: "within", size, variant }),
    "cursor-pointer items-center gap-2",
    OPEN_SHADOW[variant ?? "default"],
  );
