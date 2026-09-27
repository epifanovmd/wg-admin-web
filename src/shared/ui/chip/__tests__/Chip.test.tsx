import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Chip } from "../Chip";

describe("Chip", () => {
  it("renders an inline span by default", () => {
    const { container } = render(<Chip>Tag</Chip>);

    expect(container.firstElementChild?.tagName).toBe("SPAN");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("exposes a real button when clickable so keyboard works", () => {
    const onClick = vi.fn();

    render(<Chip onClick={onClick}>Filter</Chip>);

    const button = screen.getByRole("button", { name: "Filter" });

    expect(button).toHaveAttribute("type", "button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has a localized remove button that does not trigger onClick", () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();

    render(
      <Chip onClick={onClick} onRemove={onRemove}>
        Tag
      </Chip>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Удалить" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disables both actions when disabled", () => {
    render(
      <Chip disabled onClick={() => {}} onRemove={() => {}}>
        Tag
      </Chip>,
    );

    expect(screen.getByRole("button", { name: "Tag" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Удалить" })).toBeDisabled();
  });
});
