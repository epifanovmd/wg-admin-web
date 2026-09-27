import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ChartSeries } from "../chart.types";
import { LineChart } from "../LineChart";

interface Point {
  label: string;
  a: number;
  b: number | null;
}

const DATA: Point[] = [
  { label: "Пн", a: 10, b: 4 },
  { label: "Вт", a: 20, b: null },
  { label: "Ср", a: 15, b: 9 },
];

const SERIES: ChartSeries<Point>[] = [
  { key: "a", label: "Серия A", value: point => point.a },
  { key: "b", label: "Серия B", value: point => point.b },
];

const renderChart = (
  props: Partial<React.ComponentProps<typeof LineChart<Point>>> = {},
) =>
  render(
    <LineChart
      data={DATA}
      series={SERIES}
      x={point => point.label}
      width={600}
      height={240}
      ariaLabel="Тестовый график"
      {...props}
    />,
  );

const getOverlay = () =>
  screen.getByRole("application", { name: "Тестовый график" });

/** Подпись X под графиком — второй HTML-тултип после блока значений. */
const getLabelTooltip = () => document.querySelectorAll(".visx-tooltip")[1];

const countLines = (container: HTMLElement) =>
  container.querySelectorAll("path.visx-linepath").length;

describe("LineChart", () => {
  it("рисует по линии на серию и подписывает их в легенде", () => {
    const { container } = renderChart();

    expect(screen.getByRole("img", { name: "Тестовый график" })).toBeVisible();
    expect(countLines(container)).toBe(2);
    expect(screen.getByRole("button", { name: "Серия A" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Серия B" })).toBeVisible();
  });

  it("клик по легенде скрывает серию, повторный — возвращает", () => {
    const { container } = renderChart();

    fireEvent.click(screen.getByRole("button", { name: "Серия B" }));
    expect(countLines(container)).toBe(1);
    expect(screen.getByRole("button", { name: "Серия B" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    fireEvent.click(screen.getByRole("button", { name: "Серия B" }));
    expect(countLines(container)).toBe(2);
  });

  it("не даёт скрыть последнюю видимую серию", () => {
    renderChart();

    fireEvent.click(screen.getByRole("button", { name: "Серия B" }));
    fireEvent.click(screen.getByRole("button", { name: "Серия A" }));

    expect(screen.getByRole("button", { name: "Серия A" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("показывает значения и подпись позиции с клавиатуры, стрелки ведут по точкам", () => {
    renderChart();

    const overlay = getOverlay();

    fireEvent.focus(overlay);

    const tooltip = screen.getByRole("tooltip");

    expect(within(tooltip).getByText("10")).toBeInTheDocument();
    expect(within(tooltip).getByText("4")).toBeInTheDocument();
    expect(getLabelTooltip()).toHaveTextContent("Пн");

    fireEvent.keyDown(overlay, { key: "ArrowRight" });
    expect(getLabelTooltip()).toHaveTextContent("Вт");
    expect(
      within(screen.getByRole("tooltip")).queryByText("Серия B"),
    ).toBeNull();

    fireEvent.keyDown(overlay, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("отдаёт содержимое тултипа в renderTooltip", () => {
    const renderTooltip = vi.fn(() => <span>custom</span>);

    renderChart({ renderTooltip });
    fireEvent.focus(getOverlay());

    expect(renderTooltip).toHaveBeenCalledWith(
      expect.objectContaining({
        index: 0,
        label: "Пн",
        entries: [
          expect.objectContaining({ key: "a", value: 10, formatted: "10" }),
          expect.objectContaining({ key: "b", value: 4, formatted: "4" }),
        ],
      }),
    );
    expect(screen.getByText("custom")).toBeInTheDocument();
  });

  it("сообщает выбранную точку в onPointClick", () => {
    const onPointClick = vi.fn();

    renderChart({ onPointClick });

    const overlay = getOverlay();

    fireEvent.focus(overlay);
    fireEvent.keyDown(overlay, { key: "End" });
    fireEvent.click(overlay);

    expect(onPointClick).toHaveBeenCalledWith(
      expect.objectContaining({ index: 2, label: "Ср" }),
    );
  });

  it("не отдаёт NaN в геометрию при пропусках в данных", () => {
    const { container } = renderChart({ showPoints: true });

    expect(container.innerHTML).not.toContain("NaN");
  });

  it("показывает заглушку вместо осей, когда данных нет", () => {
    renderChart({ data: [], emptyText: "Нет продаж" });

    expect(screen.getByText("Нет продаж")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("держит высоту в состоянии загрузки", () => {
    const { container } = renderChart({ loading: true });

    expect(container.querySelector(".animate-pulse")).not.toBeNull();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
  it("расширяет левый отступ под длинные подписи оси Y", () => {
    const { container } = renderChart({
      yAxis: { tickFormat: value => `${value} 000 000 ₽` },
    });

    const plot = container.querySelector("g.visx-group");
    const left = Number(
      /translate\(([\d.]+)/.exec(plot?.getAttribute("transform") ?? "")?.[1],
    );

    expect(left).toBeGreaterThan(48);
  });

  it("обрезает линии по области графика: выбросы за фиксированным доменом не вылезают на оси", () => {
    const { container } = renderChart({ yAxis: { domain: [0, 12] } });

    const clipped = [...container.querySelectorAll("path.visx-linepath")].map(
      path => path.closest("g[clip-path]"),
    );

    expect(clipped).toHaveLength(2);
    clipped.forEach(group => {
      const id = group?.getAttribute("clip-path")?.match(/#([^)]+)/)?.[1];

      expect(id).toBeTruthy();
      expect(container.querySelector(`clipPath[id="${id}"]`)).not.toBeNull();
    });
  });
});
