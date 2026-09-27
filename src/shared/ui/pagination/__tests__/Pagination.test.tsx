import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { Pagination } from "../Pagination";

describe("Pagination", () => {
  it("renders the ellipsis as decoration, not as a button", () => {
    render(
      <Pagination currentPage={5} totalPages={20} onPageChange={() => {}} />,
    );

    expect(screen.getByRole("navigation", { name: "Пагинация" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Перейти на страницу 5" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("button")).toHaveLength(7);
  });

  it("navigates relative to the clamped page", () => {
    const onPageChange = vi.fn();

    render(
      <Pagination
        currentPage={99}
        totalPages={10}
        onPageChange={onPageChange}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Следующая страница" }),
    ).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Предыдущая страница" }),
    );
    expect(onPageChange).toHaveBeenCalledWith(9);
  });

  it("disables every control with the disabled prop", () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={() => {}}
        showFirstLast
        disabled
      />,
    );

    screen.getAllByRole("button").forEach(button => {
      expect(button).toBeDisabled();
    });
  });
});
