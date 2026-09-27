import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { ScrollBar } from "./ScrollBar";

export type ScrollAreaOrientation = "vertical" | "horizontal" | "both";

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> {
  /** Оси прокрутки, для которых рисуются полосы. По умолчанию `vertical`. */
  orientation?: ScrollAreaOrientation;
  /**
   * Ref на прокручиваемый элемент (viewport) — для виртуализации,
   * бесконечной подгрузки и программной прокрутки.
   */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** Классы viewport. */
  viewportClassName?: string;
}

const ROOT_CLASS = "relative overflow-hidden";
const VIEWPORT_CLASS =
  "size-full rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring/50";
/* Radix оборачивает контент в `display: table`, из-за чего не работает
   `truncate` у детей; при одной вертикальной оси это не нужно. */
const VERTICAL_ONLY_VIEWPORT_CLASS = "[&>div]:block!";

const hasVertical = (orientation: ScrollAreaOrientation) =>
  orientation !== "horizontal";

const hasHorizontal = (orientation: ScrollAreaOrientation) =>
  orientation !== "vertical";

/**
 * Область с кастомными полосами прокрутки поверх нативного скролла.
 * `type`: `hover` (по умолчанию), `always`, `auto`, `scroll`.
 */
const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    {
      className,
      children,
      orientation = "vertical",
      type = "hover",
      viewportRef,
      viewportClassName,
      ...props
    },
    ref,
  ) => (
    <ScrollAreaPrimitive.Root
      ref={ref}
      type={type}
      className={cn(ROOT_CLASS, className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className={cn(
          VIEWPORT_CLASS,
          orientation === "vertical" && VERTICAL_ONLY_VIEWPORT_CLASS,
          viewportClassName,
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {hasVertical(orientation) && <ScrollBar orientation="vertical" />}
      {hasHorizontal(orientation) && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  ),
);

ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
