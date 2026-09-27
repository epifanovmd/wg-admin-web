import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { ErrorBoundary } from "../ErrorBoundary";

const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error("Взрыв");

  return <p>Всё хорошо</p>;
};

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("renders an alert fallback and recovers through the reset button", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Взрыв");

    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Попробовать снова" }));
    expect(screen.getByText("Всё хорошо")).toBeInTheDocument();
  });

  it("resets the error when resetKeys change", () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={["/a"]}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKeys={["/a"]}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKeys={["/b"]}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Всё хорошо")).toBeInTheDocument();
  });

  it("reports to onError instead of the console when the handler is given", () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError} fallback={<p>Свой фолбэк</p>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(screen.getByText("Свой фолбэк")).toBeInTheDocument();
  });
});
