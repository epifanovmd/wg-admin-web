import { LinePath } from "@visx/shape";

import type {
  ChartCurveType,
  ChartPoint,
  ChartResolvedSeries,
} from "../chart.types";
import { useChartScales } from "../hooks/chart-scales-context";
import { LINE_WIDTH, POINT_RADIUS, POINT_RING } from "../utils/chart-constants";
import { resolveCurve } from "../utils/curve";

export interface ChartLineSeriesProps<Datum> {
  series: ChartResolvedSeries<Datum>;
  curve?: ChartCurveType;
  strokeWidth?: number;
  showPoints?: boolean;
}

const isDefined = <Datum,>(point: ChartPoint<Datum>) => point.value !== null;

export const ChartLineSeries = <Datum,>({
  series,
  curve,
  strokeWidth = LINE_WIDTH,
  showPoints = false,
}: ChartLineSeriesProps<Datum>) => {
  const { yScale, positions } = useChartScales();

  const getX = (point: ChartPoint<Datum>) => positions[point.index];
  const getY = (point: ChartPoint<Datum>) => yScale(point.y1);

  const visiblePoints = showPoints ? series.points.filter(isDefined) : [];

  return (
    <g>
      <LinePath<ChartPoint<Datum>>
        data={series.points}
        x={getX}
        y={getY}
        defined={isDefined}
        curve={resolveCurve(curve)}
        stroke={series.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {visiblePoints.map(point => (
        <circle
          key={point.index}
          cx={getX(point)}
          cy={getY(point)}
          r={POINT_RADIUS}
          fill={series.color}
          stroke="var(--card)"
          strokeWidth={POINT_RING}
          pointerEvents="none"
        />
      ))}
    </g>
  );
};
