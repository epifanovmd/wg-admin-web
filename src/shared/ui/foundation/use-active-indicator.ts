import { useLatestRef } from "@shared/lib/hooks";
import * as React from "react";

export interface ActiveIndicatorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UseActiveIndicatorOptions {
  /** Селектор активного элемента внутри контейнера. */
  activeSelector: string;
  /** Значение, смена которого двигает индикатор (для управляемых списков). */
  value?: string;
  /** Ключ набора элементов: при его смене переподписываемся на размеры. */
  itemsKey?: unknown;
  /** Атрибуты, смена которых у потомков означает смену активного элемента. */
  observeAttributes?: string[];
  /** Вызывается, когда активным стал другой элемент (не при ресайзе). */
  onActiveChange?: (active: HTMLElement) => void;
}

export interface UseActiveIndicatorResult<T extends HTMLElement> {
  containerRef: React.RefObject<T | null>;
  /** Положение активного элемента; `null`, пока активного нет. */
  rect: ActiveIndicatorRect | null;
  /** `false` при первом появлении и ресайзе — переход рисуется без анимации. */
  animated: boolean;
}

interface IndicatorState {
  rect: ActiveIndicatorRect | null;
  animated: boolean;
}

const INITIAL_STATE: IndicatorState = { rect: null, animated: false };

const isSameRect = (
  a: ActiveIndicatorRect | null,
  b: ActiveIndicatorRect,
): boolean =>
  a !== null &&
  a.x === b.x &&
  a.y === b.y &&
  a.width === b.width &&
  a.height === b.height;

/**
 * Положение «бегунка» под активным элементом (Segmented, Tabs): пересчёт при
 * смене значения, при смене атрибутов потомков и при ресайзе контейнера
 * или его элементов.
 */
export const useActiveIndicator = <T extends HTMLElement>({
  activeSelector,
  value,
  itemsKey,
  observeAttributes,
  onActiveChange,
}: UseActiveIndicatorOptions): UseActiveIndicatorResult<T> => {
  const containerRef = React.useRef<T>(null);
  const [state, setState] = React.useState<IndicatorState>(INITIAL_STATE);
  const onActiveChangeRef = useLatestRef(onActiveChange);
  const lastActiveRef = React.useRef<HTMLElement | null>(null);

  const measure = React.useCallback(
    (animated: boolean) => {
      const container = containerRef.current;

      if (!container) return;

      const active = container.querySelector<HTMLElement>(activeSelector);

      if (!active) {
        lastActiveRef.current = null;
        setState(prev => (prev.rect === null ? prev : INITIAL_STATE));

        return;
      }

      if (animated && lastActiveRef.current !== active) {
        onActiveChangeRef.current?.(active);
      }

      lastActiveRef.current = active;

      const next: ActiveIndicatorRect = {
        x: active.offsetLeft,
        y: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      };

      setState(prev =>
        isSameRect(prev.rect, next)
          ? prev
          : { rect: next, animated: animated && prev.rect !== null },
      );
    },
    [activeSelector, onActiveChangeRef],
  );

  React.useLayoutEffect(() => {
    measure(true);
  }, [measure, value, itemsKey]);

  React.useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(() => measure(false));

    resizeObserver.observe(container);
    Array.from(container.children).forEach(child =>
      resizeObserver.observe(child),
    );

    return () => resizeObserver.disconnect();
  }, [measure, itemsKey]);

  const attributesKey = observeAttributes?.join(" ");

  React.useEffect(() => {
    const container = containerRef.current;

    if (!container || !attributesKey) return;

    const mutationObserver = new MutationObserver(() => measure(true));

    mutationObserver.observe(container, {
      attributes: true,
      attributeFilter: attributesKey.split(" "),
      subtree: true,
    });

    return () => mutationObserver.disconnect();
  }, [measure, attributesKey]);

  return { containerRef, rect: state.rect, animated: state.animated };
};
