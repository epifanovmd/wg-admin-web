import * as React from "react";

export interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export interface UseRippleOptions<T extends HTMLElement = HTMLButtonElement> {
  disabled?: boolean;
  onPointerDown?: (e: React.PointerEvent<T>) => void;
}

export interface UseRippleResult<T extends HTMLElement = HTMLButtonElement> {
  buttonRef: React.RefObject<T | null>;
  ripples: Ripple[];
  handlePointerDown: (e: React.PointerEvent<T>) => void;
  removeRipple: (id: number) => void;
}

/** Волна от точки нажатия; элемент-хозяин задаётся дженериком. */
export const useRipple = <T extends HTMLElement = HTMLButtonElement>({
  disabled = false,
  onPointerDown,
}: UseRippleOptions<T> = {}): UseRippleResult<T> => {
  const buttonRef = React.useRef<T>(null);
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const nextRippleId = React.useRef(0);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<T>) => {
      onPointerDown?.(e);

      if (disabled || e.button !== 0) return;

      const rect = buttonRef.current?.getBoundingClientRect();

      if (!rect) return;

      const size = Math.hypot(rect.width, rect.height) * 2;
      const id = nextRippleId.current++;

      setRipples(prev => [
        ...prev,
        {
          id,
          x: e.clientX - rect.left - size / 2,
          y: e.clientY - rect.top - size / 2,
          size,
        },
      ]);
    },
    [disabled, onPointerDown],
  );

  const removeRipple = React.useCallback((id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  }, []);

  return { buttonRef, ripples, handlePointerDown, removeRipple };
};
