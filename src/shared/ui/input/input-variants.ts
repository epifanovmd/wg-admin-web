import { cn } from "@shared/lib/utils";

import { type FieldVariantProps, fieldVariants } from "../foundation";

export const inputVariants = ({ size, variant }: InputVariantProps = {}) =>
  cn(
    fieldVariants({ focusMode: "open", size, variant }),
    "placeholder:text-muted-foreground",
  );

export type InputVariantProps = FieldVariantProps;
