import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { SelectTag } from "../SelectTag";

describe("SelectTag", () => {
  it("renders a removable tag and isolates removal events", () => {
    const onParentClick = vi.fn();
    const onRemove = vi.fn();

    render(
      <div onClick={onParentClick}>
        <SelectTag className="custom" label="First" onRemove={onRemove} />
      </div>,
    );
    const button = screen.getByRole("button");
    const pointer = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });

    button.dispatchEvent(pointer);
    expect(pointer.defaultPrevented).toBe(true);
    fireEvent.click(button);
    expect(onRemove).toHaveBeenCalledOnce();
    expect(onParentClick).not.toHaveBeenCalled();
    expect(screen.getByText("First").parentElement).toHaveClass("custom");
  });

  it("hides removal for disabled tags", () => {
    render(<SelectTag disabled label="First" onRemove={vi.fn()} />);

    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("First").parentElement).toHaveClass("opacity-50");
  });
});
