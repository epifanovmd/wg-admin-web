import { cn } from "@shared/lib/utils";
import { useParentSize } from "@visx/responsive";
import type { ReactNode } from "react";

import type { ChartBaseProps } from "../chart.types";
import type { ChartModel } from "../hooks/use-chart";
import { DEFAULT_CHART_HEIGHT } from "../utils/chart-constants";
import { ChartCanvas } from "./ChartCanvas";
import { ChartEmpty } from "./ChartEmpty";
import { ChartLegend } from "./ChartLegend";
import type { ChartLegendShape } from "./ChartLegendItem";
import { ChartSkeleton } from "./ChartSkeleton";

export interface ChartRootProps<Datum> extends Pick<
  ChartBaseProps<Datum>,
  | "height"
  | "width"
  | "grid"
  | "legend"
  | "legendToggle"
  | "tooltip"
  | "renderTooltip"
  | "onPointClick"
  | "loading"
  | "emptyText"
  | "ariaLabel"
  | "className"
> {
  model: ChartModel<Datum>;
  legendShape: ChartLegendShape;
  /** Строка «Всего» в тултипе — для стека. */
  showTotal?: boolean;
  /** Серии графика. */
  children: ReactNode;
}

const RESIZE_DEBOUNCE_MS = 16;

/** Каркас: замер ширины, легенда, состояния загрузки и пустоты, холст. */
export const ChartRoot = <Datum,>({
  model,
  legendShape,
  showTotal,
  height = DEFAULT_CHART_HEIGHT,
  width: widthProp,
  grid = "y",
  legend = "bottom",
  legendToggle = true,
  tooltip = true,
  renderTooltip,
  onPointClick,
  loading = false,
  emptyText = "Нет данных",
  ariaLabel,
  className,
  children,
}: ChartRootProps<Datum>) => {
  const { parentRef, width: measuredWidth } = useParentSize({
    debounceTime: RESIZE_DEBOUNCE_MS,
  });

  const width = widthProp ?? measuredWidth;

  const showLegend = legend !== false && model.series.length > 1;
  const showCanvas = !loading && !model.isEmpty && width > 0;

  const legendNode = showLegend ? (
    <ChartLegend
      series={model.series}
      shape={legendShape}
      onToggle={legendToggle ? model.toggleSeries : undefined}
    />
  ) : null;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {legend === "top" && legendNode}

      <div ref={parentRef} className="relative w-full" style={{ height }}>
        {loading && <ChartSkeleton />}

        {!loading && model.isEmpty && <ChartEmpty>{emptyText}</ChartEmpty>}

        {showCanvas && (
          <ChartCanvas
            model={model}
            width={width}
            height={height}
            grid={grid}
            tooltip={tooltip}
            renderTooltip={renderTooltip}
            showTotal={showTotal}
            onPointClick={onPointClick}
            ariaLabel={ariaLabel}
          >
            {children}
          </ChartCanvas>
        )}
      </div>

      {legend === "bottom" && legendNode}
    </div>
  );
};
