import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { selectContentClasses } from "../select-variants";
import type { DropdownMaxWidth, DropdownWidth } from "../types";

export interface SelectPopoverContentProps extends React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> {
  children?: React.ReactNode;
  width?: DropdownWidth;
  maxWidth?: DropdownMaxWidth;
  /** Контейнер портала; `null` — рендер без портала. */
  container?: HTMLElement | null;
}

const TRIGGER_WIDTH_CLASS = "w-[var(--radix-popover-trigger-width)]";
const TRIGGER_MIN_WIDTH_CLASS = "min-w-[var(--radix-popover-trigger-width)]";
const TRIGGER_MAX_WIDTH_CLASS = "max-w-[var(--radix-popover-trigger-width)]";

const resolveWidthClass = (
  width: DropdownWidth,
  hasNumericMaxWidth: boolean,
): string | undefined => {
  if (width === "trigger") return TRIGGER_WIDTH_CLASS;
  if (width === "auto" && !hasNumericMaxWidth) return TRIGGER_MIN_WIDTH_CLASS;

  return undefined;
};

export const SelectPopoverContent = ({
  className,
  children,
  sideOffset = 4,
  align = "start",
  avoidCollisions = true,
  width = "trigger",
  maxWidth,
  container,
  onOpenAutoFocus,
  ...props
}: SelectPopoverContentProps) => {
  const hasNumericMaxWidth = typeof maxWidth === "number";

  const style = React.useMemo<React.CSSProperties | undefined>(() => {
    if (typeof width !== "number" && typeof maxWidth !== "number") {
      return undefined;
    }

    return {
      width: typeof width === "number" ? width : undefined,
      maxWidth: typeof maxWidth === "number" ? maxWidth : undefined,
    };
  }, [width, maxWidth]);

  // Фокус остаётся в триггере (инпут/кнопка): список управляется через
  // aria-activedescendant.
  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
    onOpenAutoFocus?.(event);
  };

  const content = (
    <PopoverPrimitive.Content
      sideOffset={sideOffset}
      align={align}
      avoidCollisions={avoidCollisions}
      onOpenAutoFocus={handleOpenAutoFocus}
      className={cn(
        selectContentClasses,
        resolveWidthClass(width, hasNumericMaxWidth),
        maxWidth === "trigger" && TRIGGER_MAX_WIDTH_CLASS,
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </PopoverPrimitive.Content>
  );

  if (container === null) return content;

  return (
    <PopoverPrimitive.Portal container={container}>
      {content}
    </PopoverPrimitive.Portal>
  );
};
