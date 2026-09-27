import { cn } from "@shared/lib/utils";

import {
  type FieldVariantProps,
  fieldVariants,
  INHERIT_FONT_CLASS,
} from "../foundation";
import { popoverContentVariants } from "../popover";

/** Контент дропдауна: анимации из Popover + плотный список без паддинга.
 *  Тень и кольцо: на тёмной теме список почти сливался с панелью под ним. */
export const selectContentClasses = cn(
  popoverContentVariants({ variant: "default", size: "auto" }),
  "overflow-hidden p-0 shadow-xl ring-1 ring-black/10 dark:ring-white/10",
);

export const selectItemClasses = [
  "relative flex w-full cursor-pointer select-none items-center rounded-md",
  "py-1.5 pl-8 pr-2 text-sm outline-none transition-colors duration-150",
].join(" ");

export const selectItemHighlightedClasses = "bg-accent text-accent-foreground";

/** Подпись группы опций (в обычном и виртуальном списке). */
export const selectGroupLabelClasses =
  "px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide";

export const selectSearchInputClasses = `flex-1 min-w-0 bg-transparent outline-none ${INHERIT_FONT_CLASS} text-inherit placeholder:text-muted-foreground cursor-text`;

const resolveValidationVariant = (
  variant: FieldVariantProps["variant"],
  valid: boolean | null | undefined,
): FieldVariantProps["variant"] => {
  if (valid == null) return variant;

  const isFilled = variant?.startsWith("filled");

  if (valid) return isFilled ? "filled-success" : "success";

  return isFilled ? "filled-error" : "error";
};

export const selectTriggerVariants = ({
  size,
  variant,
  valid,
}: SelectTriggerVariantProps = {}) =>
  cn(
    fieldVariants({
      focusMode: "within",
      size,
      variant: resolveValidationVariant(variant, valid),
    }),
    "items-center justify-between gap-2 whitespace-nowrap",
  );

export interface SelectTriggerVariantProps extends FieldVariantProps {
  valid?: boolean | null;
}
