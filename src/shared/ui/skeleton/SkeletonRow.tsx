import { cn } from "@shared/lib/utils";
import * as React from "react";

import type { AvatarSize } from "../avatar";
import { Skeleton } from "./Skeleton";
import { SkeletonAvatar } from "./SkeletonAvatar";

export interface SkeletonRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Показывать аватар слева (по умолчанию true). */
  avatar?: boolean;
  avatarSize?: AvatarSize;
}

const ROOT_CLASS = "flex w-full items-center gap-3";
const TEXT_CLASS = "flex min-w-0 flex-1 flex-col gap-2";
const TITLE_CLASS = "h-3.5 w-2/5";
const SUBTITLE_CLASS = "h-3 w-4/5";

/** Строка списка/чата: аватар и две строки текста. */
const SkeletonRow = React.forwardRef<HTMLDivElement, SkeletonRowProps>(
  ({ avatar = true, avatarSize = "md", className, ...props }, ref) => (
    <div ref={ref} aria-hidden className={cn(ROOT_CLASS, className)} {...props}>
      {avatar && <SkeletonAvatar size={avatarSize} />}
      <div className={TEXT_CLASS}>
        <Skeleton className={TITLE_CLASS} />
        <Skeleton className={SUBTITLE_CLASS} />
      </div>
    </div>
  ),
);

SkeletonRow.displayName = "SkeletonRow";

export { SkeletonRow };
