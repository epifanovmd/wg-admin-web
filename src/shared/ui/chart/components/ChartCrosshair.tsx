import { Line } from "@visx/shape";

import type { ChartResolvedSeries } from "../chart.types";
import { useChartScales } from "../hooks/chart-scales-context";
import { POINT_RADIUS, POINT_RING } from "../utils/chart-constants";

export interface ChartCrosshairProps<Datum> {
  series: ChartResolvedSeries<Datum>[];
  index: number;
}

const CROSSHAIR_STROKE = "var(--muted-foreground)";

/** Вертикаль на позиции данных и точка каждой серии с тенью под ней. */
export const ChartCrosshair = <Datum,>({
  series,
  index,
}: ChartCrosshairProps<Datum>) => {
  const { yScale, positions, innerHeight } = useChartScales();

  const x = positions[index];

  const points = series.flatMap(item => {
    const point = item.points[index];

    return point && point.value !== null
      ? { key: item.key, color: item.color, y: yScale(point.y1) }
      : [];
  });

  return (
    <g pointerEvents="none">
      <Line
        from={{ x, y: 0 }}
        to={{ x, y: innerHeight }}
        stroke={CROSSHAIR_STROKE}
        strokeWidth={1}
        strokeDasharray="5,2"
        strokeOpacity={0.6}
      />

      {points.map(point => (
        <g key={point.key}>
          <circle
            cx={x}
            cy={point.y + 1}
            r={POINT_RADIUS}
            fill="black"
            fillOpacity={0.1}
            stroke="black"
            strokeOpacity={0.1}
            strokeWidth={POINT_RING}
          />
          <circle
            cx={x}
            cy={point.y}
            r={POINT_RADIUS}
            fill={point.color}
            stroke="var(--card)"
            strokeWidth={POINT_RING}
          />
        </g>
      ))}
    </g>
  );
};
