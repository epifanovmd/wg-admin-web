import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { TooltipContent, type TooltipContentProps } from "./TooltipContent";

export interface TooltipProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Root
> {
  /** Шорткат: `children` становится триггером, `content` — подсказкой. */
  content?: React.ReactNode;
  contentProps?: TooltipContentProps;
}

export const Tooltip = ({
  content,
  contentProps,
  children,
  ...props
}: TooltipProps) => {
  if (content === undefined) {
    return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
  }

  /* Текст не может принять пропсы триггера — оборачиваем в фокусируемый span. */
  const trigger = React.isValidElement(children) ? (
    children
  ) : (
    <span tabIndex={0}>{children}</span>
  );

  return (
    <TooltipPrimitive.Root {...props}>
      <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
      <TooltipContent {...contentProps}>{content}</TooltipContent>
    </TooltipPrimitive.Root>
  );
};
