import type { FieldVariantProps } from "../../foundation";

type FieldVariant = FieldVariantProps["variant"];

/** Переводит вариант поля в его error-версию, когда RHF пометил поле невалидным. */
export const resolveFieldVariant = (
  variant: FieldVariant,
  invalid: boolean,
): FieldVariant => {
  if (!invalid) return variant;

  return variant === "filled" || variant === "filled-success"
    ? "filled-error"
    : "error";
};
