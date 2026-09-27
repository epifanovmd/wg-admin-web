import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { Slider } from "../Slider";

describe("Slider", () => {
  it("одиночное значение: подпись «Значение» и число в onValueChange", () => {
    const onValueChange = vi.fn();

    render(<Slider defaultValue={20} onValueChange={onValueChange} />);

    const thumb = screen.getByRole("slider", { name: "Значение" });

    expect(thumb).toHaveAttribute("aria-valuenow", "20");

    fireEvent.keyDown(thumb, { key: "ArrowRight" });

    expect(onValueChange).toHaveBeenCalledWith(21);
    expect(thumb).toHaveAttribute("aria-valuenow", "21");
  });

  it("диапазон: подписи «Минимум»/«Максимум» и массив в onValueChange", () => {
    const onValueChange = vi.fn();

    render(
      <Slider defaultValue={[10, 80]} step={5} onValueChange={onValueChange} />,
    );

    const max = screen.getByRole("slider", { name: "Максимум" });

    expect(screen.getByRole("slider", { name: "Минимум" })).toHaveAttribute(
      "aria-valuenow",
      "10",
    );

    fireEvent.focus(max);
    fireEvent.keyDown(max, { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenCalledWith([10, 75]);
  });

  it("управляемое значение не меняется без обновления родителем", () => {
    const Controlled = () => {
      const [value, setValue] = React.useState([20, 40]);

      return <Slider value={value} onValueChange={setValue} />;
    };

    render(<Controlled />);

    const min = screen.getByRole("slider", { name: "Минимум" });

    fireEvent.keyDown(min, { key: "ArrowRight" });
    expect(min).toHaveAttribute("aria-valuenow", "21");
  });

  it("getThumbLabel и formatValue задают имя и aria-valuetext ползунка", () => {
    render(
      <Slider
        defaultValue={30}
        getThumbLabel={() => "Громкость"}
        formatValue={value => `${value}%`}
      />,
    );

    expect(screen.getByRole("slider", { name: "Громкость" })).toHaveAttribute(
      "aria-valuetext",
      "30%",
    );
  });

  it("aria-labelledby одиночного слайдера подписывает ползунок", () => {
    render(
      <>
        <span id="volume-label">Громкость</span>
        <Slider aria-labelledby="volume-label" defaultValue={5} />
      </>,
    );

    expect(
      screen.getByRole("slider", { name: "Громкость" }),
    ).toBeInTheDocument();
  });

  it("showValue выводит подпись над ползунком, marks — метки шкалы", () => {
    const { container } = render(
      <Slider
        defaultValue={50}
        showValue
        formatValue={value => `${value} ₽`}
        marks={[
          { value: 0, label: "0" },
          { value: 50 },
          { value: 100, label: "100" },
        ]}
      />,
    );

    expect(screen.getByText("50 ₽")).toBeInTheDocument();
    expect(
      container.querySelectorAll('[data-slot="slider-mark"]'),
    ).toHaveLength(3);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("disabled блокирует изменение с клавиатуры", () => {
    const onValueChange = vi.fn();

    render(<Slider defaultValue={10} disabled onValueChange={onValueChange} />);

    const thumb = screen.getByRole("slider", { name: "Значение" });

    fireEvent.keyDown(thumb, { key: "ArrowRight" });

    expect(onValueChange).not.toHaveBeenCalled();
    expect(thumb).toHaveAttribute("data-disabled");
  });

  it("пробрасывает vertical-ориентацию и aria-describedby на ползунки", () => {
    render(
      <>
        <p id="hint">Подсказка</p>
        <Slider
          defaultValue={10}
          orientation="vertical"
          aria-describedby="hint"
        />
      </>,
    );

    const thumb = screen.getByRole("slider", { name: "Значение" });

    expect(thumb).toHaveAttribute("aria-orientation", "vertical");
    expect(thumb).toHaveAccessibleDescription("Подсказка");
  });
});
