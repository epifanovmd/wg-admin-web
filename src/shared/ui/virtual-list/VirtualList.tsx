import { mergeRefs } from "@shared/lib/hooks";
import { cn } from "@shared/lib/utils";
import * as React from "react";

import { useVirtualList, type UseVirtualListOptions } from "./use-virtual-list";

export interface VirtualListProps<T>
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    Omit<UseVirtualListOptions<T>, "rangeExtractor"> {
  /** Содержимое строки; оборачивается в позиционированный контейнер. */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Высота собственного скролл-контейнера (без `scrollElementRef`). */
  height?: number | string;
  /** Контент при пустом `items`. */
  emptyContent?: React.ReactNode;
  /** Классы обёртки каждой строки. */
  itemClassName?: string;
}

const SCROLL_CLASS = "relative overflow-auto";
const INNER_CLASS = "relative w-full";
const ITEM_CLASS = "absolute top-0 left-0 w-full";

/**
 * Виртуализированный список: в DOM только видимое окно строк, высота строк
 * меряется динамически. Скроллится сам (`height`/`className`) либо внутри
 * внешнего контейнера (`scrollElementRef`, например viewport ScrollArea).
 * Ref указывает на корневой элемент (скролл-контейнер или внутренний блок).
 */
const VirtualListInner = <T,>(
  {
    items,
    renderItem,
    estimateSize,
    getItemKey,
    overscan,
    gap,
    scrollElementRef,
    scrollMargin,
    onEndReached,
    endReachedThreshold,
    initialRect,
    height,
    emptyContent,
    itemClassName,
    className,
    style,
    ...props
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const { scrollRef, virtualItems, totalSize, measureElement } = useVirtualList(
    {
      items,
      estimateSize,
      getItemKey,
      overscan,
      gap,
      scrollElementRef,
      scrollMargin,
      onEndReached,
      endReachedThreshold,
      initialRect,
    },
  );

  const mergedRef = React.useMemo(
    () => mergeRefs<HTMLDivElement>([ref, scrollRef]),
    [ref, scrollRef],
  );

  const offset = scrollMargin ?? 0;
  const isEmpty = items.length === 0;

  const rows = virtualItems.map(item => (
    <div
      key={item.key}
      ref={measureElement}
      data-index={item.index}
      className={cn(ITEM_CLASS, itemClassName)}
      style={{ transform: `translateY(${item.start - offset}px)` }}
    >
      {renderItem(items[item.index] as T, item.index)}
    </div>
  ));

  if (scrollElementRef) {
    const sizeStyle = isEmpty ? undefined : { height: totalSize };

    return (
      <div
        ref={ref}
        className={cn(INNER_CLASS, className)}
        style={{ ...sizeStyle, ...style }}
        {...props}
      >
        {isEmpty ? emptyContent : rows}
      </div>
    );
  }

  return (
    <div
      ref={mergedRef}
      className={cn(SCROLL_CLASS, className)}
      style={{ height, ...style }}
      {...props}
    >
      {isEmpty ? (
        emptyContent
      ) : (
        <div className={INNER_CLASS} style={{ height: totalSize }}>
          {rows}
        </div>
      )}
    </div>
  );
};

const VirtualListForwarded = React.forwardRef(VirtualListInner);

VirtualListForwarded.displayName = "VirtualList";

export const VirtualList = VirtualListForwarded as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;
