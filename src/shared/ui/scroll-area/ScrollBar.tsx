import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { scrollBarVariants } from "./scroll-area-variants";

export type ScrollBarProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Scrollbar
>;

const THUMB_CLASS =
  "relative flex-1 rounded-full bg-border transition-colors hover:bg-muted-foreground/50";

/** Полоса прокрутки `ScrollArea` для одной оси. */
const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Scrollbar>,
  ScrollBarProps
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(scrollBarVariants({ orientation }), className)}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb className={THUMB_CLASS} />
  </ScrollAreaPrimitive.Scrollbar>
));

ScrollBar.displayName = "ScrollBar";

export { ScrollBar };
