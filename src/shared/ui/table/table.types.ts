import type {
  ColumnDef,
  Row,
  Table as TanstackTable,
  TableOptions,
} from "@tanstack/react-table";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

import type {
  ColumnFilterConfig,
  ColumnFilterOption,
} from "./components/table-head-filter";
import type {
  tableHeadVariants,
  tableVariants,
} from "./components/table-variants";
import type { TableLabels } from "./constants";
import type {
  InfiniteScrollFeatureMeta,
  TableFeatureResult,
} from "./hooks/features/types";

export type { ColumnFilterConfig, ColumnFilterOption };

declare module "@tanstack/react-table" {
  // Параметры расширяемого интерфейса должны совпадать с исходными.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    filter?: ColumnFilterConfig<TValue>;
    /** Текстовое имя колонки для aria-label и списка видимости, если `header` — не строка. */
    label?: string;
    /** Выравнивание заголовка, ячеек и футера колонки (числа — `right`). */
    align?: TableColumnAlign;
  }
}

export type TableColumnAlign = "left" | "center" | "right";

export type TableSize = NonNullable<
  VariantProps<typeof tableHeadVariants>["size"]
>;

export type TableVariant = NonNullable<
  VariantProps<typeof tableVariants>["variant"]
>;

export type TableRowEvent = React.SyntheticEvent<HTMLTableRowElement>;

export type TableRowClickHandler<TData> = (
  row: TData,
  event: TableRowEvent,
) => void;

/** Атрибуты строки: стандартные HTML + произвольные `data-*`. */
export type TableRowAttributes = React.HTMLAttributes<HTMLTableRowElement> & {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export interface TableBulkSelection<TData> {
  /** Выбранные строки (по всем страницам, среди загруженных данных). */
  rows: Row<TData>[];
  /** Снимает выделение со всех строк. */
  clear: () => void;
}

export type TableBulkActionsRenderer<TData> = (
  selection: TableBulkSelection<TData>,
) => React.ReactNode;

export interface TableVirtualOptions {
  /** Оценка высоты строки до замера, px; по умолчанию — по `size`. */
  estimateSize?: number;
  /** Сколько строк рендерить за пределами видимой области. */
  overscan?: number;
}

export interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  features?: TableFeatureResult<TData>[];

  variant?: TableVariant;
  size?: TableSize;
  stickyHeader?: boolean;
  stickyFooter?: boolean;

  /** Корневой контейнер (тулбар + скролл + пагинация). */
  className?: string;
  /** Скролл-контейнер вокруг `<table>`. */
  containerClassName?: string;
  /** Сам элемент `<table>`. */
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  rowClassName?: string | ((row: TData) => string);

  /** Слот слева над таблицей (поиск, кнопки действий). */
  toolbar?: React.ReactNode;
  showColumnVisibility?: boolean;
  labels?: Partial<TableLabels>;
  caption?: React.ReactNode;
  "aria-label"?: string;

  loading?: boolean;
  refreshing?: boolean;
  /** Ошибка загрузки: `true` — текст по умолчанию, иначе — переданный узел. */
  error?: React.ReactNode;
  empty?: React.ReactNode;

  onRowClick?: TableRowClickHandler<TData>;
  onRowDoubleClick?: TableRowClickHandler<TData>;
  /** Произвольные атрибуты строки (data-*, aria-*, title). */
  getRowProps?: (row: Row<TData>) => TableRowAttributes | undefined;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;

  tableOptions?: Partial<TableOptions<TData>>;

  /**
   * Действия над выбранными строками (нужна `useRowSelectionFeature`): над
   * таблицей появляется панель «Выбрано: N» с этими действиями и сбросом.
   */
  bulkActions?: TableBulkActionsRenderer<TData>;
  /**
   * Виртуализация строк: рендерится только видимое окно, высоту держат
   * строки-распорки, так что `<table>`-семантика и sticky-шапка сохраняются.
   * Высота строк (и раскрытых подкомпонентов) замеряется после рендера.
   * Скролл-контейнеру нужна ограниченная высота (`containerClassName` или
   * flex-родитель), иначе виртуализировать нечего.
   */
  virtual?: boolean | TableVirtualOptions;
}

export interface TableInstanceResult<TData = unknown> {
  table: TanstackTable<TData>;
  rows: Row<TData>[];
  totalColumns: number;
  hasFooter: boolean;
  sortingEnabled: boolean;
  filteringEnabled: boolean;
  paginationEnabled: boolean;
  resizingEnabled: boolean;
  pinningEnabled: boolean;
  groupingEnabled: boolean;
  selectionEnabled: boolean;
  renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode;
  pageSizeOptions?: readonly number[];
  infiniteScroll?: InfiniteScrollFeatureMeta;
}

export type { TanstackTable };
