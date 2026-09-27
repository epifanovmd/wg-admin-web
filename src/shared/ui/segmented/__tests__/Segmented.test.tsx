import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Segmented } from "../Segmented";

const options = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

describe("Segmented", () => {
  it("keeps one persistent indicator when selection changes", () => {
    const { container, rerender } = render(
      <Segmented options={options} value="compact" />,
    );
    const indicator = container.querySelector(
      '[data-slot="segmented-indicator"]',
    );

    rerender(<Segmented options={options} value="comfortable" />);

    expect(container.querySelector('[data-slot="segmented-indicator"]')).toBe(
      indicator,
    );
    expect(indicator?.closest("button")).toBeNull();
  });

  it("reports the selected value", () => {
    const onChange = vi.fn();

    render(<Segmented options={options} onValueChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Comfortable" }));

    expect(onChange).toHaveBeenCalledWith("comfortable");
  });

  it("exposes radiogroup semantics with the first option selected by default", () => {
    render(<Segmented options={options} aria-label="Плотность" />);

    expect(screen.getByRole("radiogroup", { name: "Плотность" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Compact" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Comfortable" }),
    ).not.toBeChecked();
  });

  it("does not fall back to the first option for an empty controlled value", () => {
    render(<Segmented options={options} value="" />);

    expect(screen.queryByRole("radio", { checked: true })).toBeNull();
  });

  it("moves selection and focus with arrow keys, skipping disabled options", () => {
    const onChange = vi.fn();

    render(
      <Segmented
        options={[options[0]!, { ...options[1]!, disabled: true }, options[2]!]}
        onValueChange={onChange}
      />,
    );

    const first = screen.getByRole("radio", { name: "Compact" });
    const last = screen.getByRole("radio", { name: "Spacious" });

    expect(first).toHaveAttribute("tabindex", "0");
    expect(last).toHaveAttribute("tabindex", "-1");

    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });

    expect(onChange).toHaveBeenLastCalledWith("spacious");
    expect(last).toBeChecked();
    expect(last).toHaveFocus();

    fireEvent.keyDown(last, { key: "ArrowRight" });
    expect(first).toBeChecked();

    fireEvent.keyDown(first, { key: "End" });
    expect(last).toBeChecked();

    fireEvent.keyDown(last, { key: "Home" });
    expect(first).toBeChecked();
  });
});

describe("Segmented: ширина пунктов", () => {
  it("по содержимому, без сжатия меньше подписи", () => {
    // Длинная подпись не должна вылезать за подсветку пункта.
    render(
      <Segmented
        options={[
          { value: "ipip", label: "Через IPIP-туннель" },
          { value: "direct", label: "Напрямую" },
        ]}
      />,
    );

    for (const item of screen.getAllByRole("radio")) {
      expect(item.className).toContain("flex-auto");
      expect(item.className).toContain("shrink-0");
      expect(item.className).not.toMatch(/(^|\s)flex-1(\s|$)/);
    }
  });
});
