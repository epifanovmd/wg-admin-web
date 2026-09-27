import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AreaChart } from "../AreaChart";
import type { ChartSeries } from "../chart.types";
import { LineChart } from "../LineChart";

interface Point {
  label: string;
  value: number;
}

const DATA: Point[] = [
  { label: "Пн", value: 10 },
  { label: "Вт", value: 20 },
  { label: "Ср", value: 15 },
];

const SERIES: ChartSeries<Point>[] = [
  { key: "value", label: "Значение", value: point => point.value },
];

const getX = (point: Point) => point.label;

const yTickLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".visx-axis-left text")).map(
    node => node.textContent,
  );

describe("Chart annotations", () => {
  it("рисует горизонтальную линию с подписью и расширяет домен Y до неё", () => {
    const { container } = render(
      <LineChart
        data={DATA}
        series={SERIES}
        x={getX}
        width={600}
        height={240}
        referenceLines={[{ y: 100, label: "План", dashed: true }]}
      />,
    );

    const line = container.querySelector("[data-chart-reference='y'] line");

    expect(line).not.toBeNull();
    expect(line).toHaveAttribute("y1", line!.getAttribute("y2"));
    expect(line).toHaveAttribute("stroke-dasharray");
    expect(screen.getByText("План")).toBeInTheDocument();
    expect(yTickLabels(container)).toContain("100");
  });

  it("вертикальная линия встаёт на позицию категории X", () => {
    const { container } = render(
      <LineChart
        data={DATA}
        series={SERIES}
        x={getX}
        width={600}
        height={240}
        referenceLines={[{ x: "Вт", label: "Релиз", variant: "warning" }]}
      />,
    );

    const line = container.querySelector("[data-chart-reference='x'] line");

    expect(line).toHaveAttribute("x1", line!.getAttribute("x2"));
    expect(line).toHaveAttribute("stroke", "var(--warning)");
    expect(screen.getByText("Релиз")).toBeInTheDocument();
  });

  it("пропускает линию с X вне данных", () => {
    const { container } = render(
      <LineChart
        data={DATA}
        series={SERIES}
        x={getX}
        width={600}
        height={240}
        referenceLines={[{ x: "Вс" }]}
      />,
    );

    expect(container.querySelector("[data-chart-reference]")).toBeNull();
  });

  it("рисует полосу целевой зоны под сериями и обрезает аннотации по области графика", () => {
    const { container } = render(
      <AreaChart
        data={DATA}
        series={SERIES}
        x={getX}
        width={600}
        height={240}
        bands={[{ from: 30, to: 40, label: "Цель", variant: "success" }]}
      />,
    );

    const band = container.querySelector("[data-chart-band] rect");
    const clipped = container
      .querySelector("[data-chart-band]")!
      .closest("g[clip-path]");

    expect(band).not.toBeNull();
    expect(band).toHaveAttribute("fill", "var(--success)");
    expect(Number(band!.getAttribute("height"))).toBeGreaterThan(0);
    expect(screen.getByText("Цель")).toBeInTheDocument();
    expect(clipped).not.toBeNull();
    expect(yTickLabels(container)).toContain("40");
  });

  it("фиксированный домен оси не расширяется аннотациями", () => {
    const { container } = render(
      <LineChart
        data={DATA}
        series={SERIES}
        x={getX}
        width={600}
        height={240}
        yAxis={{ domain: [0, 30] }}
        referenceLines={[{ y: 100 }]}
      />,
    );

    expect(yTickLabels(container)).not.toContain("100");
  });

  it("подпись вертикальной линии у правого края встаёт слева от линии и не обрезается", () => {
    const { container } = render(
      <LineChart
        data={DATA}
        series={SERIES}
        x={getX}
        width={600}
        height={240}
        referenceLines={[
          { x: "Пн", label: "Старт" },
          { x: "Ср", label: "Финиш" },
        ]}
      />,
    );

    const start = screen.getByText("Старт");
    const finish = screen.getByText("Финиш");

    expect(start).toHaveAttribute("text-anchor", "start");
    expect(finish).toHaveAttribute("text-anchor", "end");
    expect(finish.closest("g[clip-path]")).toBeNull();
    expect(
      container
        .querySelector("[data-chart-reference] line")
        ?.closest("g[clip-path]"),
    ).not.toBeNull();
  });
});
