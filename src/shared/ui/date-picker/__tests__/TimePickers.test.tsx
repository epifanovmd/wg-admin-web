import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { DatePicker } from "../DatePicker";
import { MaskedDatePicker } from "../MaskedDatePicker";
import { TimePicker } from "../TimePicker";

const MARCH_12_0930 = new Date(2024, 2, 12, 9, 30);

/** Radix возвращает фокус после закрытия асинхронно (FocusScope, `setTimeout`). */
const flushFocusScope = () =>
  act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

describe("TimePicker", () => {
  it("выбор из списка меняет только время и сохраняет день", () => {
    const onChange = vi.fn();

    render(
      <TimePicker
        aria-label="Время"
        value={MARCH_12_0930}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Время" });

    expect(input).toHaveValue("09:30");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const listbox = screen.getByRole("listbox");

    expect(screen.getByRole("option", { name: "09:30" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(listbox).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: "14:30" }));

    expect(onChange).toHaveBeenCalledWith(new Date(2024, 2, 12, 14, 30));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("ввод по маске HH:mm отдаёт дату с новым временем", () => {
    const onChange = vi.fn();

    render(
      <TimePicker
        aria-label="Время"
        value={MARCH_12_0930}
        onChange={onChange}
      />,
    );

    fireEvent.input(screen.getByRole("textbox", { name: "Время" }), {
      target: { value: "18:45" },
    });

    expect(onChange).toHaveBeenLastCalledWith(new Date(2024, 2, 12, 18, 45));
  });

  it("step задаёт шаг списка времени", () => {
    render(<TimePicker aria-label="Время" step={15} />);

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Время" }), {
      key: "ArrowDown",
    });

    expect(screen.getAllByRole("option")).toHaveLength(96);
    expect(screen.getByRole("option", { name: "00:15" })).toBeInTheDocument();
  });

  it("без значения применяет время к referenceDate", () => {
    const onChange = vi.fn();

    render(
      <TimePicker
        aria-label="Время"
        referenceDate={new Date(2024, 0, 5)}
        onChange={onChange}
      />,
    );

    fireEvent.input(screen.getByRole("textbox", { name: "Время" }), {
      target: { value: "07:05" },
    });

    expect(onChange).toHaveBeenLastCalledWith(new Date(2024, 0, 5, 7, 5));
  });

  it("стрелками навигирует по списку и выбирает Enter", () => {
    const onChange = vi.fn();

    render(
      <TimePicker
        aria-label="Время"
        value={MARCH_12_0930}
        onChange={onChange}
      />,
    );

    fireEvent.keyDown(screen.getByRole("textbox", { name: "Время" }), {
      key: "ArrowDown",
    });

    const selected = screen.getByRole("option", { name: "09:30" });

    expect(selected).toHaveFocus();

    fireEvent.keyDown(selected, { key: "ArrowDown" });
    const next = screen.getByRole("option", { name: "10:00" });

    expect(next).toHaveFocus();

    fireEvent.keyDown(next, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(new Date(2024, 2, 12, 10, 0));
  });

  it("openOnFocus: переход фокуса в другое поле закрывает список и не возвращает фокус", async () => {
    render(
      <>
        <TimePicker aria-label="Время" openOnFocus />
        <input aria-label="Другое поле" />
      </>,
    );

    const input = screen.getByRole("textbox", { name: "Время" });
    const other = screen.getByRole("textbox", { name: "Другое поле" });

    act(() => input.focus());
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    act(() => other.focus());
    await flushFocusScope();

    expect(screen.queryByRole("listbox")).toBeNull();
    expect(other).toHaveFocus();
  });

  it("openOnFocus: клик в поле с фокусом снова открывает список", async () => {
    render(<TimePicker aria-label="Время" openOnFocus />);

    const input = screen.getByRole("textbox", { name: "Время" });

    act(() => input.focus());
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
    await flushFocusScope();
    expect(screen.queryByRole("listbox")).toBeNull();

    fireEvent.click(input);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("openOnFocus: после выбора из списка он не открывается снова", async () => {
    render(<TimePicker aria-label="Время" openOnFocus />);

    act(() => screen.getByRole("textbox", { name: "Время" }).focus());
    const option = screen.getByRole("option", { name: "10:00" });

    // В браузере клик по варианту с tabindex переносит на него фокус.
    act(() => option.focus());
    fireEvent.click(option);
    await flushFocusScope();

    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("DatePicker withTime", () => {
  it("показывает дату со временем и сохраняет время при выборе дня", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        aria-label="Начало"
        withTime
        value={MARCH_12_0930}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Начало" });

    expect(trigger).toHaveTextContent("12 марта 2024, 09:30");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "15 марта 2024" }));

    expect(onChange).toHaveBeenCalledWith(new Date(2024, 2, 15, 9, 30));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("смена времени под календарём сохраняет выбранный день", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        aria-label="Начало"
        withTime
        value={MARCH_12_0930}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Начало" }));

    const time = screen.getByRole("textbox", { name: "Время" });

    expect(time).toHaveValue("09:30");

    fireEvent.input(time, { target: { value: "14:15" } });
    expect(onChange).toHaveBeenLastCalledWith(new Date(2024, 2, 12, 14, 15));
  });

  it("timeStep задаёт шаг стрелок в поле времени", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        aria-label="Начало"
        withTime
        timeStep={15}
        value={MARCH_12_0930}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Начало" }));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Время" }), {
      key: "ArrowUp",
    });

    expect(onChange).toHaveBeenLastCalledWith(new Date(2024, 2, 12, 9, 45));
  });

  it("без withTime поведение прежнее: время отбрасывается, попап закрывается", () => {
    const onChange = vi.fn();

    render(
      <DatePicker
        aria-label="Дата"
        value={MARCH_12_0930}
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Дата" });

    expect(trigger).toHaveTextContent("12 марта 2024");
    expect(trigger).not.toHaveTextContent("09:30");

    fireEvent.click(trigger);
    expect(screen.queryByRole("textbox", { name: "Время" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "15 марта 2024" }));

    expect(onChange).toHaveBeenCalledWith(new Date(2024, 2, 15));
    expect(screen.queryByRole("grid")).toBeNull();
  });
});

describe("MaskedDatePicker withTime", () => {
  const renderMasked = (onChange = vi.fn(), value?: Date) =>
    render(
      <>
        <label htmlFor="start">Начало</label>
        <MaskedDatePicker
          id="start"
          withTime
          value={value}
          onChange={onChange}
        />
      </>,
    );

  it("разбирает полный ввод «дд.мм.гггг чч:мм»", () => {
    const onChange = vi.fn();

    renderMasked(onChange);

    const input = screen.getByRole("textbox", { name: "Начало" });

    expect(input).toHaveAttribute("placeholder", "дд.мм.гггг чч:мм");

    fireEvent.input(input, { target: { value: "12.03.2024" } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.input(input, { target: { value: "12.03.2024 14:30" } });
    expect(onChange).toHaveBeenLastCalledWith(new Date(2024, 2, 12, 14, 30));
  });

  it("показывает значение со временем и сохраняет время при выборе дня", () => {
    const onChange = vi.fn();

    renderMasked(onChange, MARCH_12_0930);

    const input = screen.getByRole("textbox", { name: "Начало" });

    expect(input).toHaveValue("12.03.2024 09:30");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.click(screen.getByRole("button", { name: "20 марта 2024" }));

    expect(onChange).toHaveBeenLastCalledWith(new Date(2024, 2, 20, 9, 30));
  });
});
