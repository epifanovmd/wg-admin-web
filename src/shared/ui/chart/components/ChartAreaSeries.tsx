import { LinearGradient } from "@visx/gradient";
import { Area, LinePath } from "@visx/shape";
import { useId } from "react";

import type {
  ChartCurveType,
  ChartPoint,
  ChartResolvedSeries,
} from "../chart.types";
import { useChartScales } from "../hooks/chart-scales-context";
import { AREA_FILL_OPACITY, LINE_WIDTH } from "../utils/chart-constants";
import { resolveCurve } from "../utils/curve";

export interface ChartAreaSeriesProps<Datum> {
  series: ChartResolvedSeries<Datum>;
  curve?: ChartCurveType;
  fillOpacity?: number;
  strokeWidth?: number;
}

const GRADIENT_END_OPACITY = 0.05;

const isDefined = <Datum,>(point: ChartPoint<Datum>) => point.value !== null;

/** Заливка — градиент от цвета линии к прозрачному, как в примере visx. */
export const ChartAreaSeries = <Datum,>({
  series,
  curve,
  fillOpacity = AREA_FILL_OPACITY,
  strokeWidth = LINE_WIDTH,
}: ChartAreaSeriesProps<Datum>) => {
  const { yScale, positions } = useChartScales();
  const gradientId = useId();

  const getX = (point: ChartPoint<Datum>) => positions[point.index];
  const getY0 = (point: ChartPoint<Datum>) => yScale(point.y0);
  const getY1 = (point: ChartPoint<Datum>) => yScale(point.y1);

  return (
    <g>
      <LinearGradient
        id={gradientId}
        from={series.color}
        to={series.color}
        fromOpacity={fillOpacity}
        toOpacity={GRADIENT_END_OPACITY}
      />

      <Area<ChartPoint<Datum>>
        data={series.points}
        x={getX}
        y0={getY0}
        y1={getY1}
        defined={isDefined}
        curve={resolveCurve(curve)}
        fill={`url(#${gradientId})`}
        stroke="none"
      />

      <LinePath<ChartPoint<Datum>>
        data={series.points}
        x={getX}
        y={getY1}
        defined={isDefined}
        curve={resolveCurve(curve)}
        stroke={series.color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>
  );
};
