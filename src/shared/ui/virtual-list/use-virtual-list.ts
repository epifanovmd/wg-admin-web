import { useLatestRef } from "@shared/lib/hooks";
import {
  type Range,
  type Rect,
  type ScrollToOptions,
  useVirtualizer,
  type VirtualItem,
  type Virtualizer,
} from "@tanstack/react-virtual";
import * as React from "react";

export type VirtualListEstimateSize = number | ((index: number) => number);

export interface UseVirtualListOptions<T> {
  items: readonly T[];
  /** Оценка высоты строки в px; реальная высота меряется после рендера. */
  estimateSize: VirtualListEstimateSize;
  /** Стабильный ключ строки (по умолчанию — индекс). */
  getItemKey?: (item: T, index: number) => React.Key;
  /** Сколько строк рендерить за пределами видимой области (по умолчанию 5). */
  overscan?: number;
  /** Зазор между строками в px. */
  gap?: number;
  /** Внешний скролл-контейнер; без него скроллится собственный `scrollRef`. */
  scrollElementRef?: React.RefObject<HTMLElement | null>;
  /** Отступ списка от начала внешнего скролл-контейнера (шапка над списком). */
  scrollMargin?: number;
  /** Вызывается, когда до конца списка осталось `endReachedThreshold` строк. */
  onEndReached?: () => void;
  /** Порог срабатывания `onEndReached` в строках (по умолчанию 5). */
  endReachedThreshold?: number;
  /** Какие индексы рендерить — например, чтобы держать в DOM активную строку. */
  rangeExtractor?: (range: Range) => number[];
  /** Начальный размер контейнера (SSR, тесты). */
  initialRect?: Rect;
}

export interface UseVirtualListResult {
  /** Ref собственного скролл-контейнера (когда нет `scrollElementRef`). */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  virtualizer: Virtualizer<HTMLElement, Element>;
  virtualItems: VirtualItem[];
  /** Полная высота списка в px — высота внутреннего контейнера. */
  totalSize: number;
  /** Ref-колбэк строки для динамического измерения (нужен `data-index`). */
  measureElement: (node: Element | null) => void;
  scrollToIndex: (index: number, options?: ScrollToOptions) => void;
}

const DEFAULT_OVERSCAN = 5;
const DEFAULT_END_THRESHOLD = 5;

/**
 * Headless-виртуализация на `@tanstack/react-virtual`: считает окно
 * видимых строк, меряет их реальную высоту и сообщает о приближении к концу.
 * Разметку строит потребитель — см. `VirtualList` как эталон.
 * Режима «снизу вверх» (чат) нет: для него нужен отдельный хук с якорем
 * у нижнего края и сохранением позиции при догрузке истории.
 */
export const useVirtualList = <T>({
  items,
  estimateSize,
  getItemKey,
  overscan = DEFAULT_OVERSCAN,
  gap,
  scrollElementRef,
  scrollMargin,
  onEndReached,
  endReachedThreshold = DEFAULT_END_THRESHOLD,
  rangeExtractor,
  initialRect,
}: UseVirtualListOptions<T>): UseVirtualListResult => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const latest = useLatestRef({ items, getItemKey, estimateSize });
  const onEndReachedRef = useLatestRef(onEndReached);
  const endFiredForCountRef = React.useRef(-1);

  const getKey = React.useCallback(
    (index: number): React.Key => {
      const { items: list, getItemKey: keyOf } = latest.current;
      const item = list[index];

      return keyOf && item !== undefined ? keyOf(item, index) : index;
    },
    [latest],
  );

  const estimate = React.useCallback(
    (index: number): number => {
      const size = latest.current.estimateSize;

      return typeof size === "function" ? size(index) : size;
    },
    [latest],
  );

  const virtualizer = useVirtualizer<HTMLElement, Element>({
    count: items.length,
    getScrollElement: () => scrollElementRef?.current ?? scrollRef.current,
    estimateSize: estimate,
    getItemKey: getKey,
    overscan,
    gap,
    scrollMargin,
    rangeExtractor,
    initialRect,
  });

  const [, rerender] = React.useReducer((x: number) => x + 1, 0);

  // Внешний контейнер-предок получает ref уже после layout-эффектов списка:
  // перерисовка даёт виртуализатору подхватить его.
  React.useEffect(() => {
    const external = scrollElementRef?.current;

    if (external && virtualizer.scrollElement !== external) rerender();
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastIndex = virtualItems.at(-1)?.index ?? -1;
  const count = items.length;

  React.useEffect(() => {
    if (lastIndex < 0 || count === 0) return;
    if (lastIndex < count - 1 - endReachedThreshold) return;
    // Один вызов на длину списка: догрузка меняет `count` и снимает блок.
    if (endFiredForCountRef.current === count) return;

    endFiredForCountRef.current = count;
    onEndReachedRef.current?.();
  }, [lastIndex, count, endReachedThreshold, onEndReachedRef]);

  const scrollToIndex = React.useCallback(
    (index: number, options?: ScrollToOptions) =>
      virtualizer.scrollToIndex(index, options),
    [virtualizer],
  );

  return {
    scrollRef,
    virtualizer,
    virtualItems,
    totalSize: virtualizer.getTotalSize(),
    measureElement: virtualizer.measureElement,
    scrollToIndex,
  };
};
