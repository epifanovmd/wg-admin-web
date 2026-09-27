import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Alert } from "../Alert";

describe("Alert", () => {
  it("uses polite status role for informational variants", () => {
    render(<Alert variant="info">Обновление доступно</Alert>);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("uses alert role for destructive and warning variants", () => {
    const { rerender } = render(<Alert variant="destructive">Ошибка</Alert>);

    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(<Alert variant="warning">Внимание</Alert>);

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders a localized close button", () => {
    const onClose = vi.fn();

    render(<Alert onClose={onClose}>Текст</Alert>);
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
