import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";

import { Popover } from "../../../popover";
import { DatePickerTrigger } from "../DatePickerTrigger";

const renderTrigger = (
  props: Partial<React.ComponentProps<typeof DatePickerTrigger>> = {},
) =>
  render(
    <Popover>
      <DatePickerTrigger aria-label="Дата" {...props}>
        12 марта 2024
      </DatePickerTrigger>
    </Popover>,
  );

describe("DatePickerTrigger", () => {
  it("кладёт классы поля на оболочку, а ref и атрибуты — на кнопку", () => {
    const ref = React.createRef<HTMLButtonElement>();

    renderTrigger({ ref, className: "custom", size: "sm" });

    const button = screen.getByRole("button", { name: "Дата" });

    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("type", "button");
    expect(button.parentElement).toHaveClass("custom", "h-8", "rounded-lg");
  });

  it("выводит aria-invalid из варианта ошибки и уважает явное значение", () => {
    const view = renderTrigger({ variant: "error" });

    expect(screen.getByRole("button", { name: "Дата" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );

    view.rerender(
      <Popover>
        <DatePickerTrigger
          aria-label="Дата"
          aria-invalid={false}
          variant="error"
        />
      </Popover>,
    );

    expect(screen.getByRole("button", { name: "Дата" })).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  it("рендерит очистку соседней кнопкой, а не внутри триггера", () => {
    const onClear = vi.fn();

    renderTrigger({ showClear: true, onClear });

    const clear = screen.getByRole("button", { name: "Очистить" });

    expect(screen.getByRole("button", { name: "Дата" })).not.toContainElement(
      clear,
    );

    fireEvent.click(clear);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
