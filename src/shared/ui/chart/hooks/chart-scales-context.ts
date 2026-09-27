import { createContext, useContext } from "react";

import type { ChartXValue } from "../chart.types";
import type { ChartXScale } from "../utils/scales";
import type { createYScale } from "../utils/scales";

export interface ChartScales {
  xScale: ChartXScale;
  yScale: ReturnType<typeof createYScale>;
  /** Пиксельная позиция каждой точки данных по X. */
  positions: number[];
  /** Значение X → пиксель; `undefined` — категории нет в данных. */
  xToPosition: (value: ChartXValue) => number | undefined;
  innerWidth: number;
  innerHeight: number;
}

export const ChartScalesContext = createContext<ChartScales | null>(null);

/** Серии рисуются только внутри холста: там уже есть шкалы. */
export const useChartScales = (): ChartScales => {
  const scales = useContext(ChartScalesContext);

  if (!scales) {
    throw new Error("Chart series must be rendered inside ChartCanvas");
  }

  return scales;
};
