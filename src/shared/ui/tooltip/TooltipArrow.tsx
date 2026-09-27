import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@shared/lib/utils";
import * as React from "react";

export type TooltipArrowProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Arrow
>;

const TooltipArrow = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Arrow>,
  TooltipArrowProps
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn("fill-popover stroke-border", className)}
    {...props}
  />
));

TooltipArrow.displayName = "TooltipArrow";

export { TooltipArrow };
