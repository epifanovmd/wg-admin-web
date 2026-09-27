import { cn } from "@shared/lib/utils";
import * as React from "react";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Уровень заголовка по месту карточки в иерархии страницы. */
  as?: "h2" | "h3" | "h4";
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Heading = "h3", ...props }, ref) => (
    <Heading
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  ),
);

CardTitle.displayName = "CardTitle";

export { CardTitle };
