import { type RefObject, useCallback, useEffect, useRef } from "react";

const EASE = 0.22;
const LINE_HEIGHT_PX = 16;

const normalizeDelta = (event: WheelEvent) =>
  event.deltaMode === WheelEvent.DOM_DELTA_LINE
    ? event.deltaY * LINE_HEIGHT_PX
    : event.deltaY;

export interface UseSmoothHorizontalScrollResult {
  scrollToCenter: (target: HTMLElement) => void;
  scrollBy: (delta: number) => void;
  scrollToStart: () => void;
  scrollToEnd: () => void;
}

export const useSmoothHorizontalScroll = (
  ref: RefObject<HTMLElement | null>,
): UseSmoothHorizontalScrollResult => {
  const targetRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const animateTo = useCallback(
    (value: number) => {
      const el = ref.current;

      if (!el) return;

      const max = el.scrollWidth - el.clientWidth;

      targetRef.current = Math.min(max, Math.max(0, value));

      if (rafRef.current != null) return;

      const step = () => {
        const target = targetRef.current;

        if (target == null) {
          rafRef.current = null;

          return;
        }

        const current = el.scrollLeft;
        const diff = target - current;

        if (Math.abs(diff) < 0.5) {
          el.scrollLeft = target;
          rafRef.current = null;

          return;
        }

        el.scrollLeft = current + diff * EASE;
        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    },
    [ref],
  );

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;

      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      event.preventDefault();

      const base = targetRef.current ?? el.scrollLeft;

      animateTo(base + normalizeDelta(event));
    };

    el.addEventListener("wheel", onWheel, { passive: false });

    return () => el.removeEventListener("wheel", onWheel);
  }, [ref, animateTo]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const scrollToCenter = useCallback(
    (target: HTMLElement) => {
      const el = ref.current;

      if (!el) return;

      const center = target.offsetLeft + target.offsetWidth / 2;

      animateTo(center - el.clientWidth / 2);
    },
    [ref, animateTo],
  );

  const scrollBy = useCallback(
    (delta: number) => {
      const base = targetRef.current ?? ref.current?.scrollLeft ?? 0;

      animateTo(base + delta);
    },
    [ref, animateTo],
  );

  const scrollToStart = useCallback(() => animateTo(0), [animateTo]);

  const scrollToEnd = useCallback(() => {
    const el = ref.current;

    if (!el) return;

    animateTo(el.scrollWidth - el.clientWidth);
  }, [ref, animateTo]);

  return { scrollToCenter, scrollBy, scrollToStart, scrollToEnd };
};
