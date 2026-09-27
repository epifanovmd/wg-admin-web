import { Tooltip, TooltipWithBounds } from "@visx/tooltip";
import type { ReactNode } from "react";

import type { ChartMargin, ChartTooltipData } from "../chart.types";
import type { ChartActivePoint } from "../hooks/use-chart-tooltip";
import { TOOLTIP_LABEL_OFFSET, TOOLTIP_OFFSET } from "../utils/chart-constants";
import { ChartTooltipContent } from "./ChartTooltipContent";

export interface ChartTooltipProps<Datum> {
  active: ChartActivePoint;
  data: ChartTooltipData<Datum>;
  margin: ChartMargin;
  innerHeight: number;
  renderTooltip?: (data: ChartTooltipData<Datum>) => ReactNode;
  showTotal?: boolean;
}

const VALUES_CLASS_NAME =
  "pointer-events-none z-20 min-w-36 rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md";

const LABEL_CLASS_NAME =
  "pointer-events-none z-20 min-w-18 -translate-x-1/2 rounded-md border bg-popover px-2 py-1 text-center text-xs text-popover-foreground shadow-md";

/**
 * Как в примере visx «Areas»: блок значений у точки переворачивается
 * у краёв, а подпись X стоит под графиком по центру позиции.
 */
export const ChartTooltip = <Datum,>({
  active,
  data,
  margin,
  innerHeight,
  renderTooltip,
  showTotal,
}: ChartTooltipProps<Datum>) => {
  const left = active.left + margin.left;

  return (
    <>
      <TooltipWithBounds
        key={active.index}
        role="tooltip"
        unstyled
        applyPositionStyle
        className={VALUES_CLASS_NAME}
        left={left + TOOLTIP_OFFSET}
        top={active.top + margin.top - TOOLTIP_OFFSET}
      >
        {renderTooltip ? (
          renderTooltip(data)
        ) : (
          <ChartTooltipContent data={data} showTotal={showTotal} />
        )}
      </TooltipWithBounds>

      <Tooltip
        unstyled
        applyPositionStyle
        className={LABEL_CLASS_NAME}
        left={left}
        top={innerHeight + margin.top - TOOLTIP_LABEL_OFFSET}
      >
        {data.label}
      </Tooltip>
    </>
  );
};
