import { fireEvent, render, screen } from "@testing-library/react";

import { Autocomplete } from "../Autocomplete";

const OPTIONS = [
  { value: "Москва", label: "Москва" },
  { value: "Минск", label: "Минск" },
];

describe("Autocomplete", () => {
  it("синхронизирует поле с внешним value (reset формы)", () => {
    const view = render(
      <Autocomplete aria-label="Город" options={OPTIONS} value="Москва" />,
    );

    const input = screen.getByRole("combobox", { name: "Город" });

    expect(input).toHaveValue("Москва");

    view.rerender(
      <Autocomplete aria-label="Город" options={OPTIONS} value="" />,
    );
    expect(input).toHaveValue("");
  });

  it("открывает список при вводе и отдаёт текст в onChange", () => {
    const onChange = vi.fn();

    render(
      <Autocomplete aria-label="Город" options={OPTIONS} onChange={onChange} />,
    );

    const input = screen.getByRole("combobox", { name: "Город" });

    fireEvent.input(input, { target: { value: "М" } });

    expect(onChange).toHaveBeenLastCalledWith("М");
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  it("подставляет value выбранной опции", () => {
    const onChange = vi.fn();

    render(
      <Autocomplete aria-label="Город" options={OPTIONS} onChange={onChange} />,
    );

    const input = screen.getByRole("combobox", { name: "Город" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("option", { name: "Минск" }));

    expect(onChange).toHaveBeenLastCalledWith("Минск");
  });
});
