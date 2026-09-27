import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { OtpInput } from "../OtpInput";

const getCells = () => screen.getAllByRole("textbox");

const paste = (target: HTMLElement, text: string) =>
  fireEvent.paste(target, { clipboardData: { getData: () => text } });

describe("OtpInput", () => {
  it("рендерит length ячеек с доступными именами и one-time-code на первой", () => {
    render(<OtpInput length={4} aria-label="Код" />);

    const cells = getCells();

    expect(cells).toHaveLength(4);
    expect(screen.getByRole("group", { name: "Код" })).toBeInTheDocument();
    expect(cells[0]).toHaveAccessibleName("Символ 1 из 4");
    expect(cells[3]).toHaveAccessibleName("Символ 4 из 4");
    expect(cells[0]).toHaveAttribute("autocomplete", "one-time-code");
    expect(cells[1]).toHaveAttribute("autocomplete", "off");
    expect(cells[0]).toHaveAttribute("inputmode", "numeric");
  });

  it("ввод переводит фокус дальше и вызывает onComplete на последнем символе", () => {
    const onValueChange = vi.fn();
    const onComplete = vi.fn();

    render(
      <OtpInput
        length={3}
        onValueChange={onValueChange}
        onComplete={onComplete}
      />,
    );

    const cells = getCells();

    cells[0]!.focus();
    fireEvent.change(cells[0]!, { target: { value: "1" } });
    expect(cells[1]).toHaveFocus();

    fireEvent.change(cells[1]!, { target: { value: "2" } });
    fireEvent.change(cells[2]!, { target: { value: "3" } });

    expect(onValueChange).toHaveBeenLastCalledWith("123");
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith("123");
  });

  it("numeric-режим отбрасывает буквы, alphanumeric — принимает", () => {
    const onValueChange = vi.fn();
    const view = render(<OtpInput onValueChange={onValueChange} />);

    fireEvent.change(getCells()[0]!, { target: { value: "a" } });
    expect(onValueChange).not.toHaveBeenCalled();

    view.rerender(
      <OtpInput mode="alphanumeric" onValueChange={onValueChange} />,
    );
    fireEvent.change(getCells()[0]!, { target: { value: "a" } });
    expect(onValueChange).toHaveBeenCalledWith("a");
    expect(getCells()[0]).toHaveAttribute("inputmode", "text");
  });

  it("заменяет символ при вводе поверх заполненной ячейки", () => {
    const onValueChange = vi.fn();

    render(
      <OtpInput defaultValue="123" length={3} onValueChange={onValueChange} />,
    );

    fireEvent.change(getCells()[1]!, { target: { value: "29" } });

    expect(onValueChange).toHaveBeenLastCalledWith("193");
  });

  it("вставка полного кода заполняет все ячейки", () => {
    const onComplete = vi.fn();

    render(<OtpInput onComplete={onComplete} />);

    const cells = getCells();

    paste(cells[2]!, "12-34 56");

    expect(cells.map(cell => (cell as HTMLInputElement).value)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
    expect(onComplete).toHaveBeenCalledWith("123456");
    expect(cells[5]).toHaveFocus();
  });

  it("автозаполнение из SMS в первой ячейке раскладывает код по ячейкам", () => {
    const onValueChange = vi.fn();

    render(<OtpInput length={4} onValueChange={onValueChange} />);

    fireEvent.change(getCells()[0]!, { target: { value: "4321" } });

    expect(onValueChange).toHaveBeenLastCalledWith("4321");
  });

  it("Backspace стирает символ, а в пустой ячейке — предыдущий с переходом назад", () => {
    const Controlled = () => {
      const [value, setValue] = React.useState("12");

      return <OtpInput length={4} value={value} onValueChange={setValue} />;
    };

    render(<Controlled />);

    const cells = getCells();

    cells[2]!.focus();
    fireEvent.keyDown(cells[2]!, { key: "Backspace" });

    expect(cells[1]).toHaveFocus();
    expect(cells[1]).toHaveValue("");
    expect(cells[0]).toHaveValue("1");

    fireEvent.keyDown(cells[1]!, { key: "Backspace" });
    expect(cells[0]).toHaveFocus();
    expect(cells[0]).toHaveValue("");
  });

  it("стрелки двигают фокус, клик в пустой хвост ведёт к первой пустой ячейке", () => {
    render(<OtpInput length={4} defaultValue="1" />);

    const cells = getCells();

    cells[0]!.focus();
    fireEvent.keyDown(cells[0]!, { key: "ArrowRight" });
    expect(cells[1]).toHaveFocus();

    fireEvent.keyDown(cells[1]!, { key: "ArrowLeft" });
    expect(cells[0]).toHaveFocus();

    fireEvent.focus(cells[3]!);
    expect(cells[1]).toHaveFocus();
  });

  it("mask прячет символы, disabled блокирует все ячейки", () => {
    const view = render(<OtpInput mask defaultValue="12" length={3} />);

    expect(getCells()[0]).toHaveValue("•");
    expect(getCells()[2]).toHaveValue("");

    view.rerender(<OtpInput mask disabled defaultValue="12" length={3} />);
    getCells().forEach(cell => expect(cell).toBeDisabled());
  });

  it("error-вариант выставляет aria-invalid, а separator рисует разделитель", () => {
    const { container } = render(
      <OtpInput length={4} separator={2} variant="error" />,
    );

    getCells().forEach(cell =>
      expect(cell).toHaveAttribute("aria-invalid", "true"),
    );
    expect(
      container.querySelectorAll('[data-slot="otp-input-separator"]'),
    ).toHaveLength(1);
  });

  it("пробрасывает ref и id в первую ячейку и отдаёт значение в скрытый input", () => {
    const ref = React.createRef<HTMLInputElement>();
    const { container } = render(
      <OtpInput ref={ref} id="otp" name="code" defaultValue="42" length={4} />,
    );

    expect(ref.current).toBe(getCells()[0]);
    expect(getCells()[0]).toHaveAttribute("id", "otp");
    expect(container.querySelector('input[type="hidden"]')).toHaveAttribute(
      "name",
      "code",
    );
    expect(container.querySelector('input[type="hidden"]')).toHaveValue("42");
  });
});
