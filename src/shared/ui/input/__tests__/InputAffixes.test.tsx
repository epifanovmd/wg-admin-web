import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { Input } from "../Input";

const mockOffsetWidth = (width: number) =>
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(width);

const getRoot = (input: HTMLElement) =>
  input.closest('[data-slot="input-root"]');

describe("Input: prefix / suffix", () => {
  it("рисует текстовые аффиксы внутри поля и не делает их интерактивными", () => {
    render(<Input aria-label="Сумма" prefix="https://" suffix="₽" />);

    const input = screen.getByRole("textbox", { name: "Сумма" });
    const root = getRoot(input);
    const prefix = root?.querySelector('[data-slot="input-prefix"]');
    const suffix = root?.querySelector('[data-slot="input-suffix"]');

    expect(prefix).toHaveTextContent("https://");
    expect(suffix).toHaveTextContent("₽");
    expect(prefix).toHaveClass("pointer-events-none");
    expect(suffix).toHaveClass("pointer-events-none");
  });

  it("связывает аффиксы с полем через aria-describedby, не теряя внешний id", () => {
    render(
      <>
        <p id="hint">Подсказка</p>
        <Input
          aria-label="Цена"
          aria-describedby="hint"
          prefix="от"
          suffix="₽"
        />
      </>,
    );

    expect(
      screen.getByRole("textbox", { name: "Цена" }),
    ).toHaveAccessibleDescription("Подсказка от ₽");
  });

  it("сдвигает текст поля на ширину аффиксов", () => {
    mockOffsetWidth(20);

    render(<Input aria-label="Сумма" prefix="$" suffix="USD" />);

    const input = screen.getByRole("textbox", { name: "Сумма" });

    expect(input.style.paddingLeft).toBe("38px");
    expect(input.style.paddingRight).toBe("38px");
  });

  it("ставит префикс после левой иконки и учитывает её в отступе", () => {
    mockOffsetWidth(10);

    render(
      <Input
        aria-label="Сайт"
        leftIcon={<span>icon</span>}
        prefix="https://"
      />,
    );

    const input = screen.getByRole("textbox", { name: "Сайт" });
    const prefix = getRoot(input)?.querySelector('[data-slot="input-prefix"]');

    expect(prefix).toHaveClass("left-10");
    expect(input.style.paddingLeft).toBe("56px");
  });

  it("держит суффикс рядом с действиями: очистка и загрузка не скрывают его", () => {
    const view = render(
      <Input aria-label="Вес" suffix="кг" clearable defaultValue="12" />,
    );

    const input = screen.getByRole("textbox", { name: "Вес" });
    const actions = getRoot(input)?.querySelector(
      '[data-slot="input-actions"]',
    );

    expect(actions?.firstElementChild).toHaveAttribute(
      "data-slot",
      "input-suffix",
    );
    expect(screen.getByRole("button", { name: "Очистить" })).toBeVisible();

    view.rerender(<Input aria-label="Вес" suffix="кг" loading />);
    expect(screen.getByText("кг")).toBeVisible();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("сохраняет пользовательский style поля поверх рассчитанных отступов", () => {
    mockOffsetWidth(20);

    render(
      <Input aria-label="Стиль" prefix="$" style={{ paddingLeft: "4px" }} />,
    );

    const input = screen.getByRole("textbox", { name: "Стиль" });

    expect(input.style.paddingLeft).toBe("4px");
    fireEvent.change(input, { target: { value: "1" } });
    expect(input).toHaveValue("1");
  });

  it("без аффиксов не задаёт inline-отступы", () => {
    render(<Input aria-label="Обычное" leftIcon={<span>i</span>} />);

    const input = screen.getByRole("textbox", { name: "Обычное" });

    expect(input.style.paddingLeft).toBe("");
    expect(input).toHaveClass("pl-10");
  });
});
