import { cn } from "@shared/lib/utils";
import * as React from "react";

export type PageStateFrameProps = React.HTMLAttributes<HTMLDivElement>;

/** Растягивается на всё свободное место страницы и центрирует содержимое. */
const PageStateFrame = React.forwardRef<HTMLDivElement, PageStateFrameProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-1 flex-col items-center justify-center",
        className,
      )}
      {...props}
    />
  ),
);

PageStateFrame.displayName = "PageStateFrame";

export { PageStateFrame };
