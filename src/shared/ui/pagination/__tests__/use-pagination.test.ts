import { renderHook } from "@testing-library/react";

import { buildPageItems, usePagination } from "../hooks/use-pagination";

describe("buildPageItems", () => {
  it("lists every page when they fit into maxVisible", () => {
    expect(buildPageItems(3, 5, 7)).toEqual([1, 2, 3, 4, 5]);
    expect(buildPageItems(1, 7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("keeps exactly maxVisible items with a window around the current page", () => {
    expect(buildPageItems(1, 10, 7)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(buildPageItems(5, 10, 7)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
    expect(buildPageItems(10, 10, 7)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });

  it("derives the sibling count from maxVisible", () => {
    expect(buildPageItems(10, 20, 5)).toEqual([
      1,
      "ellipsis",
      10,
      "ellipsis",
      20,
    ]);
    expect(buildPageItems(10, 20, 9)).toEqual([
      1,
      "ellipsis",
      8,
      9,
      10,
      11,
      12,
      "ellipsis",
      20,
    ]);
    expect(buildPageItems(10, 20, 8)).toHaveLength(7);
  });

  it("never shows an ellipsis in place of a single hidden page", () => {
    expect(buildPageItems(4, 10, 7)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(buildPageItems(7, 10, 7)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });

  it("handles an empty and a single page", () => {
    expect(buildPageItems(1, 0, 7)).toEqual([]);
    expect(buildPageItems(1, 1, 7)).toEqual([1]);
  });
});

describe("usePagination", () => {
  it("clamps the current page into the valid range", () => {
    const { result: above } = renderHook(() =>
      usePagination({ currentPage: 42, totalPages: 10 }),
    );

    expect(above.current.page).toBe(10);
    expect(above.current.hasNext).toBe(false);
    expect(above.current.hasPrev).toBe(true);

    const { result: below } = renderHook(() =>
      usePagination({ currentPage: 0, totalPages: 10 }),
    );

    expect(below.current.page).toBe(1);
    expect(below.current.hasPrev).toBe(false);
    expect(below.current.pages).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
  });

  it("reports no navigation for an empty list", () => {
    const { result } = renderHook(() =>
      usePagination({ currentPage: 1, totalPages: 0 }),
    );

    expect(result.current.pages).toEqual([]);
    expect(result.current.hasPrev).toBe(false);
    expect(result.current.hasNext).toBe(false);
  });
});
