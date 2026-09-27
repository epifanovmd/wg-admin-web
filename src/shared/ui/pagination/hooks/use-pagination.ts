import { useMemo } from "react";

export type PageItem = number | "ellipsis";

export interface UsePaginationOptions {
  currentPage: number;
  totalPages: number;
  /**
   * Сколько элементов (страниц и многоточий) показывать, когда страниц больше.
   * Окно строится симметрично вокруг текущей страницы: первая и последняя
   * страницы видны всегда, число соседей выводится из `maxVisible`.
   */
  maxVisible?: number;
}

export interface UsePaginationResult {
  pages: PageItem[];
  /** Текущая страница, зажатая в диапазон `1..totalPages`. */
  page: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/** Первая + последняя + два многоточия + текущая. */
const FIXED_ITEMS = 5;

const range = (start: number, end: number): number[] =>
  Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const buildPageItems = (
  currentPage: number,
  totalPages: number,
  maxVisible: number,
): PageItem[] => {
  if (totalPages < 1) return [];

  const visible = Math.max(FIXED_ITEMS, Math.floor(maxVisible));

  if (totalPages <= visible) return range(1, totalPages);

  const siblingCount = Math.floor((visible - FIXED_ITEMS) / 2);
  const page = clamp(currentPage, 1, totalPages);
  const windowSize = siblingCount * 2 + 1;

  const siblingsStart = clamp(
    page - siblingCount,
    2 + 1,
    totalPages - windowSize - 1,
  );
  const siblingsEnd = siblingsStart + windowSize - 1;

  const leading: PageItem[] = siblingsStart > 3 ? ["ellipsis"] : [2];
  const trailing: PageItem[] =
    siblingsEnd < totalPages - 2 ? ["ellipsis"] : [totalPages - 1];

  return [
    1,
    ...leading,
    ...range(siblingsStart, siblingsEnd),
    ...trailing,
    totalPages,
  ];
};

export const usePagination = ({
  currentPage,
  totalPages,
  maxVisible = 7,
}: UsePaginationOptions): UsePaginationResult => {
  const page = clamp(currentPage, 1, Math.max(totalPages, 1));

  const pages = useMemo(
    () => buildPageItems(page, totalPages, maxVisible),
    [page, totalPages, maxVisible],
  );

  return {
    pages,
    page,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
};
