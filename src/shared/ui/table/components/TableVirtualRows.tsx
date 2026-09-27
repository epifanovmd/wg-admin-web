import type { ColumnSizingState, Row } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";

import type {
  TableProps,
  TableRowClickHandler,
  TableVirtualOptions,
} from "../table.types";
import { TableDataRow } from "./TableDataRow";
import { TableExpandedRow } from "./TableExpandedRow";
import { TableSpacerRow } from "./TableSpacerRow";

export interface TableVirtualRowsProps<TData> {
  rows: Row<TData>[];
  totalColumns: number;
  columnSizing: ColumnSizingState;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  options: Required<TableVirtualOptions>;
  onRowClick?: TableRowClickHandler<TData>;
  onRowDoubleClick?: TableRowClickHandler<TData>;
  rowClassName?: string | ((row: TData) => string);
  getRowProps?: TableProps<TData>["getRowProps"];
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  resizable?: boolean;
}

/** Строк в первом кадре — до того, как контейнер прокрутки измерен. */
const INITIAL_ROWS = 20;

interface VirtualItem<TData> {
  key: string;
  row: Row<TData>;
  expanded: boolean;
}

/** Раскрытый подкомпонент — отдельный элемент списка: его высота меряется сама. */
const flattenRows = <TData,>(
  rows: Row<TData>[],
  withSubComponent: boolean,
): VirtualItem<TData>[] =>
  rows.flatMap(row => {
    const item = { key: row.id, row, expanded: false };

    if (!withSubComponent || !row.getIsExpanded()) return [item];

    return [item, { key: `${row.id}:expanded`, row, expanded: true }];
  });

/**
 * Окно видимых строк между двумя распорками. Лишняя распорка нулевой высоты
 * сохраняет чётность строк, иначе полосы `striped` прыгали бы при прокрутке.
 */
export const TableVirtualRows = <TData,>({
  rows,
  totalColumns,
  columnSizing,
  scrollContainerRef,
  options,
  onRowClick,
  onRowDoubleClick,
  rowClassName,
  getRowProps,
  renderSubComponent,
  resizable,
}: TableVirtualRowsProps<TData>) => {
  const items = React.useMemo(
    () => flattenRows(rows, !!renderSubComponent),
    [rows, renderSubComponent],
  );

  const getItemKey = React.useCallback(
    (index: number) => items[index]?.key ?? index,
    [items],
  );

  /**
   * Ref контейнера прикрепляется после layout-эффектов потомков, поэтому
   * элемент прокрутки забирается в состояние уже после монтирования.
   */
  const [scrollElement, setScrollElement] = React.useState<HTMLElement | null>(
    null,
  );

  React.useEffect(() => {
    setScrollElement(scrollContainerRef.current);
  }, [scrollContainerRef]);

  const virtualizer = useVirtualizer<HTMLElement, HTMLTableRowElement>({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => options.estimateSize,
    overscan: options.overscan,
    initialRect: { width: 0, height: options.estimateSize * INITIAL_ROWS },
    getItemKey,
    useFlushSync: false,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const first = virtualItems[0];
  const last = virtualItems[virtualItems.length - 1];
  const paddingTop = first?.start ?? 0;
  const paddingBottom = last ? virtualizer.getTotalSize() - last.end : 0;
  const needsParityRow = (first?.index ?? 0) % 2 === 0;

  return (
    <>
      <TableSpacerRow
        colSpan={totalColumns}
        height={paddingTop}
        placement="top"
      />
      {needsParityRow && (
        <TableSpacerRow colSpan={totalColumns} height={0} placement="parity" />
      )}

      {virtualItems.map(virtualItem => {
        const item = items[virtualItem.index];

        if (!item) return null;

        if (item.expanded && renderSubComponent) {
          return (
            <TableExpandedRow
              key={item.key}
              row={item.row}
              colSpan={totalColumns}
              renderSubComponent={renderSubComponent}
              measureRef={virtualizer.measureElement}
              virtualIndex={virtualItem.index}
            />
          );
        }

        return (
          <TableDataRow
            key={item.key}
            row={item.row}
            cells={item.row.getVisibleCells()}
            columnSizing={columnSizing}
            isSelected={item.row.getIsSelected()}
            isExpanded={item.row.getIsExpanded()}
            onRowClick={onRowClick}
            onRowDoubleClick={onRowDoubleClick}
            className={rowClassName}
            getRowProps={getRowProps}
            resizable={resizable}
            measureRef={virtualizer.measureElement}
            virtualIndex={virtualItem.index}
          />
        );
      })}

      <TableSpacerRow
        colSpan={totalColumns}
        height={paddingBottom}
        placement="bottom"
      />
    </>
  );
};
