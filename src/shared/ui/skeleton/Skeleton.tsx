import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { skeletonVariants } from "./skeleton-variants";

export interface SkeletonProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

/**
 * Блок-заглушка на время загрузки. Размер задаётся через `className`
 * (`h-4 w-32`). Скрыт от скринридера — объявлять загрузку должен
 * `SkeletonGroup` или контейнер с `aria-busy`.
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, radius, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden
      className={cn(skeletonVariants({ radius }), className)}
      {...props}
    />
  ),
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
