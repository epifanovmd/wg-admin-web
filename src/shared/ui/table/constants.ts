export const DEFAULT_PAGE_SIZE = 20;

export const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [10, 20, 50, 100];

/** Задержка применения текстового фильтра и async-поиска опций фильтра, мс. */
export const FILTER_DEBOUNCE_MS = 300;

/** Оценка высоты строки для виртуализации до замера, px — по размеру таблицы. */
export const VIRTUAL_ROW_ESTIMATE = { sm: 37, md: 49, lg: 57 } as const;

export const VIRTUAL_OVERSCAN = 8;

/** Все пользовательские строки таблицы; переопределяются пропом `labels`. */
export const TABLE_LABELS = {
  empty: "Нет данных",
  error: "Не удалось загрузить данные",
  selectAll: "Выбрать все",
  selectRow: "Выбрать строку",
  expandRow: "Развернуть строку",
  collapseRow: "Свернуть строку",
  groupByColumn: "Группировать по колонке",
  ungroupColumn: "Разгруппировать по колонке",
  columnVisibility: "Показать/скрыть колонки",
  allColumns: "Все колонки",
  pinLeft: "Закрепить слева",
  pinRight: "Закрепить справа",
  columnFilter: (column: string) => `Фильтр колонки „${column}“`,
  filterAll: "Все",
  filterSearch: "Поиск…",
  page: (current: number, total: number) => `Страница ${current} из ${total}`,
  rowCount: (count: number) => `Всего строк: ${count}`,
  perPage: (size: number) => `${size} / стр.`,
  selectedCount: (count: number) => `Выбрано: ${count}`,
  clearSelection: "Снять выделение",
  bulkActions: "Действия с выбранными строками",
};

export type TableLabels = typeof TABLE_LABELS;
