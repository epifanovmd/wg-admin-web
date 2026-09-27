import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AsyncButton } from "../AsyncButton";
import { Button } from "../Button";

describe("Button", () => {
  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Ok</Button>);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("marks busy state while loading", () => {
    render(<Button loading>Save</Button>);

    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
  });
});

describe("AsyncButton", () => {
  it("shows loading until the click promise settles", async () => {
    let resolve: () => void = () => {};
    const onClick = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r;
        }),
    );

    render(<AsyncButton onClick={onClick}>Send</AsyncButton>);

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      resolve();
    });

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("с asChild рендерит дочерний элемент со стилями кнопки", () => {
    render(
      <Button asChild variant="outline" size="sm">
        <a href="/orders">Заказы</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Заказы" });

    expect(link).toHaveAttribute("href", "/orders");
    expect(link).toHaveClass("h-8", "border");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
