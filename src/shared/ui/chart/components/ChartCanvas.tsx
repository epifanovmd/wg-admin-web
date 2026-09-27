import { Group } from "@visx/group";
import type { ReactNode } from "react";
import { useCallback } from "react";

import type { ChartGridMode, ChartTooltipData } from "../chart.types";
import { ChartScalesContext } from "../hooks/chart-scales-context";
import type { ChartModel } from "../hooks/use-chart";
import { useChartScales } from "../hooks/use-chart-scales";
import { useChartTooltip } from "../hooks/use-chart-tooltip";
import { ChartAxes } from "./ChartAxes";
import { ChartCrosshair } from "./ChartCrosshair";
import { ChartGrid } from "./ChartGrid";
import { ChartOverlay } from "./ChartOverlay";
import { ChartTooltip } from "./ChartTooltip";

export interface ChartCanvasProps<Datum> {
  model: ChartModel<Datum>;
  width: number;
  height: number;
  grid: ChartGridMode;
  tooltip: boolean;
  renderTooltip?: (data: ChartTooltipData<Datum>) => ReactNode;
  showTotal?: boolean;
  onPointClick?: (data: ChartTooltipData<Datum>) => void;
  ariaLabel?: string;
  /** Серии — рисуются внутри области графика поверх сетки. */
  children: ReactNode;
}

/** svg с сериями плюс HTML-тултипы поверх него; порядок детей — слои. */
export const ChartCanvas = <Datum,>({
  model,
  width,
  height,
  grid,
  tooltip,
  renderTooltip,
  showTotal,
  onPointClick,
  ariaLabel,
  children,
}: ChartCanvasProps<Datum>) => {
  const scales = useChartScales({ model, width, height });
  const { margin } = scales;

  const topOf = useCallback(
    (index: number) => {
      const tops = model.visibleSeries.flatMap(item => {
        const point = item.points[index];

        return point && point.value !== null ? scales.yScale(point.y1) : [];
      });

      return tops.length > 0 ? Math.min(...tops) : scales.innerHeight / 2;
    },
    [model.visibleSeries, scales],
  );

  const handleSelect = useCallback(
    (index: number) => {
      const data = model.getTooltipData(index);

      if (data) {
        onPointClick?.(data);
      }
    },
    [model, onPointClick],
  );

  const interaction = useChartTooltip({
    positions: scales.positions,
    originX: margin.left,
    topOf,
    onSelect: onPointClick ? handleSelect : undefined,
  });

  const active = tooltip || onPointClick ? interaction.active : null;
  const tooltipData = active ? model.getTooltipData(active.index) : null;

  return (
    <ChartScalesContext.Provider value={scales}>
      <svg width={width} height={height} role="img" aria-label={ariaLabel}>
        <Group left={margin.left} top={margin.top}>
          <ChartGrid mode={grid} />

          {children}

          {active && (
            <ChartCrosshair series={model.visibleSeries} index={active.index} />
          )}

          <ChartOverlay interaction={interaction} ariaLabel={ariaLabel} />
        </Group>

        <ChartAxes
          margin={margin}
          xAxis={model.xAxis}
          yAxis={model.yAxis}
          tickToX={scales.tickToX}
          formatXTick={model.formatXTick}
        />
      </svg>

      {tooltip && active && tooltipData && (
        <ChartTooltip
          active={active}
          data={tooltipData}
          margin={margin}
          innerHeight={scales.innerHeight}
          renderTooltip={renderTooltip}
          showTotal={showTotal}
        />
      )}
    </ChartScalesContext.Provider>
  );
};
