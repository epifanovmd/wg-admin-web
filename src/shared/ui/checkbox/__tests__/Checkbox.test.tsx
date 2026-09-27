import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Checkbox } from "../Checkbox";

describe("Checkbox", () => {
  it("links description through aria-describedby", () => {
    render(
      <Checkbox label="Уведомления" description="Письма о новых событиях" />,
    );

    expect(
      screen.getByRole("checkbox", { name: "Уведомления" }),
    ).toHaveAccessibleDescription("Письма о новых событиях");
  });

  it("toggles when the label text is clicked", () => {
    const onCheckedChange = vi.fn();

    render(<Checkbox label="Согласен" onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByText("Согласен"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders a bare control without label", () => {
    const { container } = render(<Checkbox aria-label="Выбрать" />);

    expect(container.firstElementChild?.tagName).toBe("BUTTON");
  });
});
