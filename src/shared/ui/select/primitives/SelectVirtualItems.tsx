import { defaultRangeExtractor, type Range } from "@tanstack/react-virtual";
import * as React from "react";

import { useVirtualList } from "../../virtual-list";
import type { SelectValue } from "../types";
import type { OptionRow } from "../utils/option-rows";

export interface SelectVirtualItemsProps<V extends SelectValue> {
  rows: OptionRow<V>[];
  renderRow: (row: OptionRow<V>) => React.ReactNode;
  /** Строка подсвеченного пункта: всегда в DOM ради `aria-activedescendant`. */
  focusedRow: number;
  /** Навигационный индекс → индекс строки. */
  rowByNavIndex: Map<number, number>;
  scrollElementRef: React.RefObject<HTMLElement | null>;
  /** Сюда регистрируется прокрутка к навигационному индексу. */
  scrollToIndexRef?: React.RefObject<((index: number) => void) | null>;
  estimateSize: number;
  overscan: number;
}

const ROW_CLASS = "absolute top-0 left-0 w-full";

const getRowKey = <V extends SelectValue>(row: OptionRow<V>) => row.key;

/** Виртуализированные строки списка опций внутри скроллера `listbox`. */
export const SelectVirtualItems = <V extends SelectValue>({
  rows,
  renderRow,
  focusedRow,
  rowByNavIndex,
  scrollElementRef,
  scrollToIndexRef,
  estimateSize,
  overscan,
}: SelectVirtualItemsProps<V>): React.ReactElement => {
  const rangeExtractor = React.useCallback(
    (range: Range) => {
      const indexes = defaultRangeExtractor(range);

      if (focusedRow < 0 || indexes.includes(focusedRow)) return indexes;

      return [...indexes, focusedRow].sort((a, b) => a - b);
    },
    [focusedRow],
  );

  const { virtualItems, totalSize, measureElement, scrollToIndex } =
    useVirtualList({
      items: rows,
      getItemKey: getRowKey,
      estimateSize,
      overscan,
      scrollElementRef,
      rangeExtractor,
    });

  React.useLayoutEffect(() => {
    if (!scrollToIndexRef) return;

    scrollToIndexRef.current = (navIndex: number) => {
      const row = rowByNavIndex.get(navIndex);

      if (row !== undefined) scrollToIndex(row, { align: "auto" });
    };

    return () => {
      scrollToIndexRef.current = null;
    };
  }, [scrollToIndexRef, rowByNavIndex, scrollToIndex]);

  return (
    <div className="relative w-full" style={{ height: totalSize }}>
      {virtualItems.map(item => (
        <div
          key={item.key}
          ref={measureElement}
          data-index={item.index}
          className={ROW_CLASS}
          style={{ transform: `translateY(${item.start}px)` }}
        >
          {renderRow(rows[item.index] as OptionRow<V>)}
        </div>
      ))}
    </div>
  );
};
