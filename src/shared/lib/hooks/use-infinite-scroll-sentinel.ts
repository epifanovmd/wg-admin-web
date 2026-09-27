import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { useLatestRef } from "./use-latest-ref";

export interface UseInfiniteScrollSentinelOptions {
  /** Скролл-контейнер; `null`/отсутствие — viewport. */
  rootRef?: RefObject<HTMLElement | null>;
  /** Есть ли ещё страницы — пока `false`, observer не создаётся. */
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  /** Отступ срабатывания; по умолчанию — один экран вперёд. */
  rootMargin?: string;
}

/** Один экран контейнера вниз: подгрузка стартует до того, как пользователь долистает до конца. */
export const DEFAULT_INFINITE_SCROLL_ROOT_MARGIN = "0px 0px 100% 0px";

/**
 * Sentinel для бесконечной прокрутки: возвращает ref, который вешается на
 * последний элемент списка; когда он попадает в зону `rootMargin`, зовётся
 * `onLoadMore`. Колбэк и флаг загрузки читаются через latest-ref, поэтому
 * их смена не пересоздаёт observer. Без `IntersectionObserver` (SSR, старые
 * окружения) — no-op.
 */
export const useInfiniteScrollSentinel = <T extends HTMLElement>({
  rootRef,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  rootMargin = DEFAULT_INFINITE_SCROLL_ROOT_MARGIN,
}: UseInfiniteScrollSentinelOptions): RefObject<T | null> => {
  const sentinelRef = useRef<T>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isFetchingRef = useLatestRef(isFetchingNextPage);
  const onLoadMoreRef = useLatestRef(onLoadMore);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !hasNextPage ||
      !sentinel ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingRef.current) {
          onLoadMoreRef.current();
        }
      },
      { root: rootRef?.current ?? null, rootMargin },
    );

    observer.observe(sentinel);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [hasNextPage, rootMargin, rootRef, isFetchingRef, onLoadMoreRef]);

  // После завершения подгрузки sentinel может по-прежнему быть в зоне видимости —
  // observer сам повторно не сработает, поэтому переподписываемся вручную.
  useEffect(() => {
    const observer = observerRef.current;
    const sentinel = sentinelRef.current;

    if (isFetchingNextPage || !observer || !sentinel) return;

    observer.unobserve(sentinel);
    observer.observe(sentinel);
  }, [isFetchingNextPage]);

  return sentinelRef;
};
