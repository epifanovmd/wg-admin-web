import { GridColumns, GridRows } from "@visx/grid";

import type { ChartGridMode } from "../chart.types";
import { useChartScales } from "../hooks/chart-scales-context";
import { DEFAULT_Y_TICK_COUNT } from "../utils/chart-constants";

export interface ChartGridProps {
  mode: ChartGridMode;
}

const GRID_STROKE = "var(--border)";

const GRID_DASH = "1,3";

export const ChartGrid = ({ mode }: ChartGridProps) => {
  const { xScale, yScale, innerWidth, innerHeight } = useChartScales();

  const showRows = mode === "y" || mode === "both";
  const showColumns = mode === "x" || mode === "both";

  return (
    <>
      {showRows && (
        <GridRows
          scale={yScale}
          width={innerWidth}
          numTicks={DEFAULT_Y_TICK_COUNT}
          stroke={GRID_STROKE}
          strokeDasharray={GRID_DASH}
          pointerEvents="none"
        />
      )}

      {showColumns && (
        <GridColumns
          scale={xScale}
          height={innerHeight}
          stroke={GRID_STROKE}
          strokeDasharray={GRID_DASH}
          pointerEvents="none"
        />
      )}
    </>
  );
};
