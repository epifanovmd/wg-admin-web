import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Radio } from "../Radio";
import { RadioGroup } from "../RadioGroup";

describe("Radio", () => {
  it("applies className to the root element", () => {
    const { container } = render(
      <Radio value="a" label="A" className="custom" />,
    );

    expect(container.firstElementChild).toHaveClass("custom");
    expect(container.firstElementChild).toContainElement(
      screen.getByRole("radio", { name: "A" }),
    );
  });

  it("toggles when the label text is clicked", () => {
    const onChange = vi.fn();

    render(<Radio value="a" label="Выбрать" onChange={onChange} />);
    fireEvent.click(screen.getByText("Выбрать"));

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("links description through aria-describedby", () => {
    render(<Radio value="a" label="Стандарт" description="Обычный план" />);

    expect(
      screen.getByRole("radio", { name: "Стандарт" }),
    ).toHaveAccessibleDescription("Обычный план");
  });
});

describe("RadioGroup", () => {
  it("reports selection and forwards ref to the group element", () => {
    const onChange = vi.fn();
    const ref = { current: null as HTMLDivElement | null };

    render(
      <RadioGroup ref={ref} defaultValue="a" onValueChange={onChange}>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "B" }));

    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
    expect(ref.current).toBe(screen.getByRole("radiogroup"));
  });
});
