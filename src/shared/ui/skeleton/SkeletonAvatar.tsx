import { cn } from "@shared/lib/utils";
import * as React from "react";

import { AVATAR_SIZE_CLASS, type AvatarSize } from "../avatar";
import { Skeleton } from "./Skeleton";

export interface SkeletonAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Размер — та же шкала, что у Avatar. */
  size?: AvatarSize;
  shape?: "circle" | "square";
}

const SHAPE_CLASS: Record<NonNullable<SkeletonAvatarProps["shape"]>, string> = {
  circle: "rounded-full",
  square: "rounded-lg",
};

/** Заглушка аватара размером с Avatar. */
const SkeletonAvatar = React.forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = "md", shape = "circle", className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      radius="none"
      className={cn(AVATAR_SIZE_CLASS[size], SHAPE_CLASS[shape], className)}
      {...props}
    />
  ),
);

SkeletonAvatar.displayName = "SkeletonAvatar";

export { SkeletonAvatar };
