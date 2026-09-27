import { useMergedRef } from "@mantine/hooks";
import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { RippleLayer, useRipple } from "../foundation";
import { iconButtonVariants } from "./icon-button-variants";

export interface IconButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">,
    VariantProps<typeof iconButtonVariants> {
  /** У кнопки-иконки нет текста — доступное имя обязательно. */
  "aria-label": string;
  /** Показывает спиннер вместо иконки и блокирует кнопку. */
  loading?: boolean;
}

type IconButtonSize = NonNullable<IconButtonProps["size"]>;

const LOADER_SIZE: Record<IconButtonSize, string> = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      children,
      disabled,
      onPointerDown,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const { buttonRef, ripples, handlePointerDown, removeRipple } = useRipple({
      disabled: isDisabled,
      onPointerDown,
    });
    const mergedRef = useMergedRef(ref, buttonRef);
    const loaderSize = LOADER_SIZE[size ?? "sm"];

    return (
      <button
        ref={mergedRef}
        type={type}
        className={cn(iconButtonVariants({ variant, size }), className)}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        onPointerDown={handlePointerDown}
        {...props}
      >
        <RippleLayer ripples={ripples} onRippleComplete={removeRipple} />
        {loading ? (
          <Loader2 aria-hidden className={cn("animate-spin", loaderSize)} />
        ) : (
          children
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";

export { IconButton };
