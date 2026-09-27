import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FILTER_DEBOUNCE_MS } from "../../../constants";
import type { FilterColumn } from "../controls/filter-control-props";
import { TextFilterControl } from "../controls/TextFilterControl";

const createColumn = (initial?: string) => {
  let value: unknown = initial;
  const column: FilterColumn = {
    getFilterValue: () => value,
    setFilterValue: vi.fn((next: unknown) => {
      value = next;
    }),
    getFacetedUniqueValues: () => new Map(),
  };

  return column;
};

const CONFIG = { type: "text" as const };

describe("TextFilterControl", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("применяет значение к колонке один раз после debounce и обрезает пробелы", () => {
    const column = createColumn();

    render(<TextFilterControl config={CONFIG} column={column} />);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "ан" } });
    fireEvent.change(input, { target: { value: "анна " } });

    expect(column.setFilterValue).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(FILTER_DEBOUNCE_MS));

    expect(column.setFilterValue).toHaveBeenCalledTimes(1);
    expect(column.setFilterValue).toHaveBeenCalledWith("анна");
    expect(input).toHaveValue("анна ");
  });

  it("синхронизирует инпут при внешнем сбросе фильтра", () => {
    const column = createColumn("анна");
    const { rerender } = render(
      <TextFilterControl config={CONFIG} column={column} />,
    );

    expect(screen.getByRole("textbox")).toHaveValue("анна");

    column.setFilterValue(undefined);
    rerender(<TextFilterControl config={CONFIG} column={column} />);

    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("отправляет undefined при очистке", () => {
    const column = createColumn("анна");

    render(<TextFilterControl config={CONFIG} column={column} />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
    act(() => vi.advanceTimersByTime(FILTER_DEBOUNCE_MS));

    expect(column.setFilterValue).toHaveBeenLastCalledWith(undefined);
  });
});
