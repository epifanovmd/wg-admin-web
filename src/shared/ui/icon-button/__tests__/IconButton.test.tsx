import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AsyncIconButton } from "../AsyncIconButton";
import { IconButton } from "../IconButton";

describe("IconButton", () => {
  it("defaults to type=button", () => {
    render(<IconButton aria-label="Удалить">x</IconButton>);

    expect(screen.getByRole("button", { name: "Удалить" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("is busy and disabled while loading", () => {
    render(
      <IconButton aria-label="Сохранить" loading>
        x
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Сохранить" });

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();
  });
});

describe("AsyncIconButton", () => {
  it("shows loading until the click promise settles", async () => {
    let resolve: () => void = () => {};
    const onClick = vi.fn(
      () =>
        new Promise<void>(r => {
          resolve = r;
        }),
    );

    render(
      <AsyncIconButton aria-label="Обновить" onClick={onClick}>
        x
      </AsyncIconButton>,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");

    await act(async () => {
      resolve();
    });

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });
});
