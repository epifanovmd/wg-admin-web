import { cn } from "@shared/lib/utils";

import {
  FIELD_SIZE_TYPO,
  type FieldVariantProps,
  fieldVariants,
} from "../foundation";

export const textareaVariants = ({
  size,
  variant,
}: TextareaVariantProps = {}) =>
  cn(
    fieldVariants({ focusMode: "self", size: null, variant }),
    FIELD_SIZE_TYPO[size ?? "md"],
    "placeholder:text-muted-foreground",
  );

export type TextareaVariantProps = FieldVariantProps;
