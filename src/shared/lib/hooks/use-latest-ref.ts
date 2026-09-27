import type { RefObject } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * Ref, всегда указывающий на последнее значение: для колбэков, которые
 * не должны менять identity, но обязаны видеть свежие пропсы.
 */
export const useLatestRef = <T>(value: T): RefObject<T> => {
  const ref = useRef(value);

  useLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
};

/** Стабильная обёртка над функцией: identity не меняется, тело — свежее. */
export const useEvent = <Args extends unknown[], Result>(
  handler: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  const ref = useLatestRef(handler);

  return useCallback((...args: Args) => ref.current(...args), [ref]);
};
