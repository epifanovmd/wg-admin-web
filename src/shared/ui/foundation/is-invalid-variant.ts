import type { FieldVariantProps } from "./field-variants";

/** Варианты поля, которые означают ошибку и должны выставлять `aria-invalid`. */
export const isInvalidVariant = (
  variant: FieldVariantProps["variant"] | undefined,
): boolean => variant === "error" || variant === "filled-error";
