import { useMergedRef } from "@mantine/hooks";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@shared/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { RippleLayer, useRipple } from "../foundation";
import { buttonVariants } from "./button-variants";

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Показывает спиннер вместо контента и блокирует кнопку. */
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /**
   * Отдать стили и поведение единственному дочернему элементу (например,
   * `Link` роутера). В этом режиме `loading`, иконки и ripple не рендерятся.
   */
  asChild?: boolean;
}

type ButtonSize = NonNullable<ButtonProps["size"]>;

const LOADER_SIZE: Record<ButtonSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      onPointerDown,
      type = "button",
      asChild = false,
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
    const loaderSize = LOADER_SIZE[size ?? "md"];
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={classes}
          aria-disabled={isDisabled || undefined}
          onPointerDown={onPointerDown}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={mergedRef}
        type={type}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        onPointerDown={handlePointerDown}
        {...props}
      >
        <RippleLayer ripples={ripples} onRippleComplete={removeRipple} />
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 aria-hidden className={cn("animate-spin", loaderSize)} />
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center gap-2",
            loading && "invisible",
          )}
        >
          {leftIcon && <span className="inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
