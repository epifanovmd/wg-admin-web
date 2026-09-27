import { useMemo } from "react";

import type { ChartMargin } from "../chart.types";
import { DEFAULT_Y_TICK_COUNT } from "../utils/chart-constants";
import { resolveYAxisWidth } from "../utils/chart-margin";
import { createYTickFormat } from "../utils/format";
import type { ChartXScaleResult } from "../utils/scales";
import { createXScale, createYScale } from "../utils/scales";
import type { ChartScales } from "./chart-scales-context";
import type { ChartModel } from "./use-chart";

export interface UseChartScalesOptions<Datum> {
  model: ChartModel<Datum>;
  width: number;
  height: number;
}

export interface UseChartScalesResult extends ChartScales {
  tickToX: ChartXScaleResult["tickToX"];
  /** Отступы с учётом ширины подписей оси Y. */
  margin: ChartMargin;
}

/**
 * Раскладка холста: шкала Y зависит только от высоты, поэтому строится
 * первой — по её подписям считается левый отступ, а уже от него ширина
 * области и шкала X.
 */
export const useChartScales = <Datum>({
  model,
  width,
  height,
}: UseChartScalesOptions<Datum>): UseChartScalesResult => {
  const innerHeight = Math.max(
    0,
    height - model.margin.top - model.margin.bottom,
  );

  const yScale = useMemo(
    () =>
      createYScale({
        points: model.visiblePoints,
        axis: model.yAxis,
        zero: model.zero,
        height: innerHeight,
        extraValues: model.annotationValues,
      }),
    [
      innerHeight,
      model.visiblePoints,
      model.yAxis,
      model.zero,
      model.annotationValues,
    ],
  );

  const margin = useMemo(() => {
    if (!model.autoYAxisWidth || model.yAxis === false) return model.margin;

    const format = createYTickFormat(model.yAxis);
    const tickCount = model.yAxis.tickCount ?? DEFAULT_Y_TICK_COUNT;
    const labels = yScale.ticks(tickCount).map(format);

    return {
      ...model.margin,
      left: resolveYAxisWidth(labels, model.margin.left),
    };
  }, [model.autoYAxisWidth, model.margin, model.yAxis, yScale]);

  const innerWidth = Math.max(0, width - margin.left - margin.right);

  const x = useMemo(
    () =>
      createXScale({
        type: model.xScaleType,
        xValues: model.xValues,
        width: innerWidth,
      }),
    [innerWidth, model.xScaleType, model.xValues],
  );

  return useMemo(
    () => ({
      xScale: x.scale,
      yScale,
      positions: x.positions,
      tickToX: x.tickToX,
      xToPosition: x.xToPosition,
      innerWidth,
      innerHeight,
      margin,
    }),
    [innerHeight, innerWidth, margin, x, yScale],
  );
};
