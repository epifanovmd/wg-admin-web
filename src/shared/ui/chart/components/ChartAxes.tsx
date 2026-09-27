import { AxisBottom, AxisLeft } from "@visx/axis";

import type {
  ChartMargin,
  ChartXAxisConfig,
  ChartXValue,
  ChartYAxisConfig,
} from "../chart.types";
import { useChartScales } from "../hooks/chart-scales-context";
import {
  DEFAULT_X_TICK_COUNT,
  DEFAULT_Y_TICK_COUNT,
} from "../utils/chart-constants";
import { createYTickFormat } from "../utils/format";

export interface ChartAxesProps {
  margin: ChartMargin;
  xAxis: ChartXAxisConfig | false;
  yAxis: ChartYAxisConfig | false;
  tickToX: (tick: unknown) => ChartXValue;
  formatXTick: (value: ChartXValue) => string;
}

const TICK_LABEL = {
  fill: "var(--muted-foreground)",
  fontSize: 11,
  fontFamily: "inherit",
} as const;

const AXIS_LABEL = { ...TICK_LABEL, textAnchor: "middle" } as const;

const X_TICK_LABEL = { ...TICK_LABEL, textAnchor: "middle", dy: 2 } as const;

const Y_TICK_LABEL = {
  ...TICK_LABEL,
  textAnchor: "end",
  dx: -6,
  dy: 3,
} as const;

const AXIS_STROKE = "var(--border)";

/** Оси рисуются вне области графика, поэтому получают отступы явно. */
export const ChartAxes = ({
  margin,
  xAxis,
  yAxis,
  tickToX,
  formatXTick,
}: ChartAxesProps) => {
  const { xScale, yScale, innerHeight } = useChartScales();

  const formatX = (tick: unknown) => formatXTick(tickToX(tick));

  const formatYValue = createYTickFormat(yAxis);
  const formatY = (tick: unknown) => formatYValue(Number(tick));

  return (
    <>
      {yAxis !== false && (
        <AxisLeft
          scale={yScale}
          left={margin.left}
          top={margin.top}
          numTicks={yAxis.tickCount ?? DEFAULT_Y_TICK_COUNT}
          tickFormat={formatY}
          label={yAxis.label}
          labelProps={AXIS_LABEL}
          tickLabelProps={Y_TICK_LABEL}
          hideAxisLine
          hideTicks
        />
      )}

      {xAxis !== false && (
        <AxisBottom
          scale={xScale}
          left={margin.left}
          top={margin.top + innerHeight}
          numTicks={xAxis.tickCount ?? DEFAULT_X_TICK_COUNT}
          tickFormat={formatX}
          label={xAxis.label}
          labelProps={AXIS_LABEL}
          tickLabelProps={X_TICK_LABEL}
          stroke={AXIS_STROKE}
          tickStroke={AXIS_STROKE}
          tickLength={4}
        />
      )}
    </>
  );
};
