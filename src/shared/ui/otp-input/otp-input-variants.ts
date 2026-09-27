import { cn } from "@shared/lib/utils";

import { type FieldVariantProps, fieldVariants } from "../foundation";

export type OtpInputVariantProps = FieldVariantProps;

type OtpSize = NonNullable<FieldVariantProps["size"]>;

/** Квадратная ячейка по шкале высот контролов; кегль крупнее, чем у Input. */
const CELL_SIZE: Record<OtpSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
};

const GROUP_GAP: Record<OtpSize, string> = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-2.5",
};

export const otpCellVariants = ({ size, variant }: OtpInputVariantProps = {}) =>
  cn(
    fieldVariants({ focusMode: "self", size, variant }),
    "grow-0 px-0 text-center font-medium tabular-nums",
    CELL_SIZE[size ?? "md"],
  );

export const otpGroupVariants = ({
  size,
}: Pick<OtpInputVariantProps, "size"> = {}) =>
  cn("inline-flex items-center", GROUP_GAP[size ?? "md"]);
