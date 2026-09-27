import { cva } from "class-variance-authority";

export const skeletonVariants = cva(
  "block shrink-0 animate-pulse bg-muted motion-reduce:animate-none",
  {
    variants: {
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      radius: "md",
    },
  },
);

/** Вертикальный зазор между строками SkeletonText. */
export const SKELETON_TEXT_GAP_CLASS = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-3",
} as const;

export type SkeletonTextGap = keyof typeof SKELETON_TEXT_GAP_CLASS;
