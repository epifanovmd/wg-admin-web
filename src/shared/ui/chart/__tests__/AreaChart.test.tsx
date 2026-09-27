import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AreaChart } from "../AreaChart";
import type { ChartSeries } from "../chart.types";

interface Point {
  month: Date;
  a: number;
  b: number | null;
}

const DATA: Point[] = [
  { month: new Date(2026, 0, 1), a: 100, b: 50 },
  { month: new Date(2026, 1, 1), a: 200, b: null },
  { month: new Date(2026, 2, 1), a: 150, b: 90 },
];

const SERIES: ChartSeries<Point>[] = [
  { key: "a", label: "Серия A", value: point => point.a },
  { key: "b", label: "Серия B", value: point => point.b },
];

const renderChart = (
  props: Partial<React.ComponentProps<typeof AreaChart<Point>>> = {},
) =>
  render(
    <AreaChart
      data={DATA}
      series={SERIES}
      x={point => point.month}
      width={600}
      height={240}
      ariaLabel="Область"
      {...props}
    />,
  );

describe("AreaChart", () => {
  it("рисует градиентную заливку на каждую серию", () => {
    const { container } = renderChart();

    expect(container.querySelectorAll("path.visx-area")).toHaveLength(2);
    expect(container.querySelectorAll("linearGradient")).toHaveLength(2);
  });

  it("в стеке показывает сумму, а пропуск считает нулём", () => {
    const { container } = renderChart({ stacked: true });

    expect(container.innerHTML).not.toContain("NaN");

    const overlay = screen.getByRole("application", { name: "Область" });

    fireEvent.focus(overlay);
    fireEvent.keyDown(overlay, { key: "ArrowRight" });

    const tooltip = screen.getByRole("tooltip");

    expect(within(tooltip).queryByText("Всего")).toBeNull();
    expect(within(tooltip).getByText("200")).toBeInTheDocument();

    fireEvent.keyDown(overlay, { key: "ArrowRight" });

    expect(
      within(screen.getByRole("tooltip")).getByText("Всего"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("tooltip")).getByText("240"),
    ).toBeInTheDocument();
  });

  it("рисует компактный вариант без осей, сетки и легенды", () => {
    const { container } = renderChart({
      series: [SERIES[0]],
      xAxis: false,
      yAxis: false,
      grid: "none",
      legend: false,
    });

    expect(container.querySelector(".visx-axis")).toBeNull();
    expect(container.querySelector(".visx-rows")).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
