import { fireEvent, render, screen, within } from "@testing-library/react";
import type * as React from "react";

import { DatePicker } from "../DatePicker";
import { DateRangePicker } from "../DateRangePicker";
import { MaskedDatePicker } from "../MaskedDatePicker";

const MARCH_12 = new Date(2024, 2, 12);

describe("DatePicker", () => {
  it("показывает дату в русской локали и выбирает день из календаря", () => {
    const onChange = vi.fn();

    render(
      <DatePicker aria-label="Дата" value={MARCH_12} onChange={onChange} />,
    );

    const trigger = screen.getByRole("button", { name: "Дата" });

    expect(trigger).toHaveTextContent("12 марта 2024");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "15 марта 2024" }));

    expect(onChange).toHaveBeenCalledWith(new Date(2024, 2, 15));
  });

  it("нормализует ISO-строку к началу дня", () => {
    render(<DatePicker aria-label="Дата" value="2024-03-12T00:00:00" />);

    expect(screen.getByRole("button", { name: "Дата" })).toHaveTextContent(
      "12 марта 2024",
    );
  });

  it("не даёт выбрать день вне minDate/maxDate", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        aria-label="Дата"
        value={MARCH_12}
        minDate={new Date(2024, 2, 10)}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Дата" }));
    fireEvent.click(screen.getByRole("button", { name: "5 марта 2024" }));

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("DateRangePicker", () => {
  it("применяет пресет и закрывает попап", () => {
    const onChange = vi.fn();
    const range = { from: new Date(2024, 2, 1), to: new Date(2024, 2, 7) };

    render(
      <DateRangePicker
        aria-label="Период"
        presets={[{ label: "Первая неделя", range }]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Период" }));
    const presets = screen.getByRole("group", { name: "Быстрый выбор" });

    fireEvent.click(
      within(presets).getByRole("button", { name: "Первая неделя" }),
    );

    expect(onChange).toHaveBeenCalledWith(range);
    expect(screen.queryByRole("group", { name: "Быстрый выбор" })).toBeNull();
  });
});

const renderMasked = (
  props: Partial<React.ComponentProps<typeof MaskedDatePicker>> = {},
) =>
  render(
    <>
      <label htmlFor="date">Дата</label>
      <MaskedDatePicker id="date" {...props} />
    </>,
  );

describe("MaskedDatePicker", () => {
  it("не стирает поле при редактировании полной даты", () => {
    const onChange = vi.fn();

    renderMasked({ value: MARCH_12, onChange });

    const input = screen.getByRole("textbox", { name: "Дата" });

    fireEvent.input(input, { target: { value: "12.03.202" } });

    expect(onChange).not.toHaveBeenCalledWith(undefined);
    expect(input).toHaveValue("12.03.202");
  });

  it("открывает календарь с клавиатуры кнопкой с доступным именем", () => {
    renderMasked();

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Дата" }), {
      key: "ArrowDown",
    });

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Открыть календарь" }),
    ).toBeInTheDocument();
  });
});
