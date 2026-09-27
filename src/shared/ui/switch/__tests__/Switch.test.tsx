import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Switch } from "../Switch";

describe("Switch", () => {
  it("renders label and description with aria wiring", () => {
    const onCheckedChange = vi.fn();

    render(
      <Switch
        label="Тёмная тема"
        description="Применяется сразу"
        onCheckedChange={onCheckedChange}
      />,
    );

    const control = screen.getByRole("switch", { name: "Тёмная тема" });

    expect(control).toHaveAccessibleDescription("Применяется сразу");
    fireEvent.click(screen.getByText("Тёмная тема"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
