import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";

import { cardVariants } from "./card-variants";
import { CardContent } from "./CardContent";
import { CardDescription } from "./CardDescription";
import { CardFooter } from "./CardFooter";
import { CardHeader } from "./CardHeader";
import { CardTitle } from "./CardTitle";

export interface CardProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof cardVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Правый слот шапки: действия, бейдж. */
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Класс `CardContent`. Заданный без шортката, тоже оборачивает `children`
   * в `CardContent` — иначе он молча терялся бы вместе с отступами.
   */
  contentClassName?: string;
}

const hasContent = (node: React.ReactNode): boolean =>
  node !== undefined && node !== null && node !== false;

/**
 * Карточка. Отступы задают секции (`CardHeader`/`CardContent`/`CardFooter`),
 * у корня своих отступов нет. Шорткат `title`/`description`/`extra`/`footer`
 * (или `contentClassName`) сам собирает секции и кладёт `children` в
 * `CardContent`; без них `children` рендерятся как есть — для составной
 * разметки из секций. `interactive` — эффект наведения из общих утилит.
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      interactive,
      title,
      description,
      extra,
      footer,
      contentClassName,
      children,
      ...props
    },
    ref,
  ) => {
    const hasHeader =
      hasContent(title) || hasContent(description) || hasContent(extra);
    const hasFooter = hasContent(footer);
    const isShorthand =
      hasHeader || hasFooter || contentClassName !== undefined;
    const hasBody = hasContent(children);

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, interactive }), className)}
        {...props}
      >
        {hasHeader && (
          <CardHeader extra={extra}>
            {hasContent(title) && <CardTitle>{title}</CardTitle>}
            {hasContent(description) && (
              <CardDescription>{description}</CardDescription>
            )}
          </CardHeader>
        )}
        {isShorthand && hasBody && (
          <CardContent className={contentClassName}>{children}</CardContent>
        )}
        {!isShorthand && children}
        {hasFooter && <CardFooter>{footer}</CardFooter>}
      </div>
    );
  },
);

Card.displayName = "Card";

export { Card };
