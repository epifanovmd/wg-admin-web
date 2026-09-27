import { cn } from "@shared/lib/utils";
import * as React from "react";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-3 md:px-6 md:py-4", className)} {...props} />
));

CardContent.displayName = "CardContent";

export { CardContent };
