import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { NumberInput, type NumberInputProps } from "../NumberInput";

const NBSP = "\u00a0";

const Controlled = ({
  initial = null,
  onValueChange,
  ...props
}: Omit<NumberInputProps, "value"> & { initial?: number | null }) => {
  const [value, setValue] = React.useState<number | null>(initial);

  return (
    <NumberInput
      aria-label="Число"
      {...props}
      value={value}
      onValueChange={next => {
        setValue(next);
        onValueChange?.(next);
      }}
    />
  );
};

const getField = () => screen.getByRole("spinbutton", { name: "Число" });

describe("NumberInput", () => {
  it("форматирует значение в ru-RU без фокуса и показывает сырое число в фокусе", () => {
    render(<Controlled initial={1234.5} precision={2} />);

    const field = getField();

    expect(field).toHaveValue(`1${NBSP}234,50`);

    fireEvent.focus(field);
    expect(field).toHaveValue("1234,5");

    fireEvent.blur(field);
    expect(field).toHaveValue(`1${NBSP}234,50`);
  });

  it("парсит ввод с запятой и отдаёт число, пустое поле — null", () => {
    const onValueChange = vi.fn();

    render(<Controlled onValueChange={onValueChange} />);

    const field = getField();

    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "12,5" } });
    expect(onValueChange).toHaveBeenLastCalledWith(12.5);

    fireEvent.change(field, { target: { value: "" } });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("не принимает буквы, минус без allowNegative и лишние знаки после запятой", () => {
    const onValueChange = vi.fn();

    render(
      <Controlled
        allowNegative={false}
        precision={1}
        onValueChange={onValueChange}
      />,
    );

    const field = getField();

    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "1a" } });
    fireEvent.change(field, { target: { value: "-1" } });
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(field, { target: { value: "1,25" } });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(field).toHaveValue("");
  });

  it("зажимает значение в [min, max] и округляет до precision при потере фокуса", () => {
    const onValueChange = vi.fn();

    render(
      <Controlled
        min={0}
        max={10}
        precision={1}
        onValueChange={onValueChange}
      />,
    );

    const field = getField();

    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "25" } });
    fireEvent.blur(field);

    expect(onValueChange).toHaveBeenLastCalledWith(10);
    expect(field).toHaveValue("10,0");
  });

  it("ArrowUp/ArrowDown меняют значение на step, с Shift — на step × 10", () => {
    const onValueChange = vi.fn();

    render(<Controlled initial={5} step={0.1} onValueChange={onValueChange} />);

    const field = getField();

    fireEvent.keyDown(field, { key: "ArrowUp" });
    expect(onValueChange).toHaveBeenLastCalledWith(5.1);

    fireEvent.keyDown(field, { key: "ArrowDown", shiftKey: true });
    expect(onValueChange).toHaveBeenLastCalledWith(4.1);
  });

  it("кнопки степпера меняют значение и выключаются на границах", () => {
    const onValueChange = vi.fn();

    render(
      <Controlled initial={9} max={10} min={9} onValueChange={onValueChange} />,
    );

    const decrement = screen.getByRole("button", { name: "Уменьшить" });
    const increment = screen.getByRole("button", { name: "Увеличить" });

    expect(decrement).toBeDisabled();

    fireEvent.click(increment);
    expect(onValueChange).toHaveBeenLastCalledWith(10);
    expect(increment).toBeDisabled();
    expect(decrement).toBeEnabled();
  });

  it("выставляет ARIA spinbutton и aria-invalid из варианта", () => {
    render(<Controlled initial={3} min={1} max={5} variant="error" />);

    const field = getField();

    expect(field).toHaveAttribute("aria-valuenow", "3");
    expect(field).toHaveAttribute("aria-valuemin", "1");
    expect(field).toHaveAttribute("aria-valuemax", "5");
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it("работает неуправляемо с defaultValue и показывает суффикс", () => {
    render(
      <NumberInput
        aria-label="Число"
        defaultValue={2}
        suffix="₽"
        formatOptions={{ minimumFractionDigits: 2 }}
      />,
    );

    const field = getField();

    expect(field).toHaveValue("2,00");
    fireEvent.click(screen.getByRole("button", { name: "Увеличить" }));
    expect(field).toHaveValue("3,00");
    expect(screen.getByText("₽")).toBeInTheDocument();
  });

  it("очистка через clearable отдаёт null", () => {
    const onValueChange = vi.fn();

    render(<Controlled initial={7} clearable onValueChange={onValueChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("disabled блокирует степпер и клавиатуру", () => {
    const onValueChange = vi.fn();

    render(<Controlled initial={1} disabled onValueChange={onValueChange} />);

    fireEvent.keyDown(getField(), { key: "ArrowUp" });
    expect(screen.getByRole("button", { name: "Увеличить" })).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
