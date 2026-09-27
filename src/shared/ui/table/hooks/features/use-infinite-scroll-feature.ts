import { useMemo } from "react";

import type { TableFeatureOf } from "./types";

export interface InfiniteScrollFeatureOptions {
  enabled?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore: () => void;
  /** `rootMargin` IntersectionObserver; по умолчанию — один экран вперёд. */
  rootMargin?: string;
}

/** Подгрузка следующей страницы при прокрутке до конца тела таблицы. */
export const useInfiniteScrollFeature = <TData = unknown>(
  options: InfiniteScrollFeatureOptions,
): TableFeatureOf<TData, "infiniteScroll"> => {
  const {
    enabled = true,
    hasNextPage = false,
    isFetchingNextPage = false,
    onLoadMore,
    rootMargin,
  } = options;

  return useMemo(
    () => ({
      kind: "infiniteScroll" as const,
      state: {},
      options: {},
      meta: {
        hasNextPage: enabled && hasNextPage,
        isFetchingNextPage: enabled && isFetchingNextPage,
        onLoadMore,
        rootMargin,
      },
    }),
    [enabled, hasNextPage, isFetchingNextPage, onLoadMore, rootMargin],
  );
};
