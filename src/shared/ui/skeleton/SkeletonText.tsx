import { cn } from "@shared/lib/utils";
import * as React from "react";

import { Skeleton } from "./Skeleton";
import {
  SKELETON_TEXT_GAP_CLASS,
  type SkeletonTextGap,
} from "./skeleton-variants";

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Количество строк (по умолчанию 3). */
  lines?: number;
  /** Зазор между строками. */
  gap?: SkeletonTextGap;
  /** Классы каждой строки (высота, радиус). */
  lineClassName?: string;
  /** Классы последней, укороченной строки. */
  lastLineClassName?: string;
}

const ROOT_CLASS = "flex w-full flex-col";
const LINE_CLASS = "h-3.5 w-full";
const LAST_LINE_CLASS = "w-3/5";

/** Абзац-заглушка: несколько строк, последняя короче. */
const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  (
    {
      lines = 3,
      gap = "md",
      className,
      lineClassName,
      lastLineClassName,
      ...props
    },
    ref,
  ) => {
    const count = Math.max(1, Math.floor(lines));
    const keys = Array.from({ length: count }, (_, index) => index);

    return (
      <div
        ref={ref}
        aria-hidden
        className={cn(ROOT_CLASS, SKELETON_TEXT_GAP_CLASS[gap], className)}
        {...props}
      >
        {keys.map(index => {
          const isLast = count > 1 && index === count - 1;

          return (
            <Skeleton
              key={index}
              className={cn(
                LINE_CLASS,
                lineClassName,
                isLast && LAST_LINE_CLASS,
                isLast && lastLineClassName,
              )}
            />
          );
        })}
      </div>
    );
  },
);

SkeletonText.displayName = "SkeletonText";

export { SkeletonText };
