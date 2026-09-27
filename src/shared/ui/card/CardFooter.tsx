import { cn } from "@shared/lib/utils";
import * as React from "react";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center gap-2 px-3 pb-3 md:px-6 md:pb-4",
      className,
    )}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

export { CardFooter };
