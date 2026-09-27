import { useCallback, useMemo } from "react";

import type {
  ChartBaseProps,
  ChartMargin,
  ChartPoint,
  ChartResolvedSeries,
  ChartTooltipData,
  ChartXAxisConfig,
  ChartXValue,
  ChartYAxisConfig,
} from "../chart.types";
import { collectAnnotationValues } from "../utils/annotations";
import { resolveChartMargin } from "../utils/chart-margin";
import {
  createTimeFormat,
  formatChartValue,
  formatChartX,
} from "../utils/format";
import type { ChartResolvedXScaleType } from "../utils/scales";
import { resolveXScaleType } from "../utils/scales";
import { buildTooltipData } from "../utils/tooltip-data";
import { useChartSeries } from "./use-chart-series";
import { useSeriesVisibility } from "./use-series-visibility";

export interface UseChartOptions<Datum> extends Pick<
  ChartBaseProps<Datum>,
  | "data"
  | "series"
  | "x"
  | "xScale"
  | "xAxis"
  | "yAxis"
  | "margin"
  | "formatValue"
  | "formatX"
  | "referenceLines"
  | "bands"
> {
  /** Включать 0 в домен Y, если ось не сказала иначе. */
  zero: boolean;
  stacked?: boolean;
}

export interface ChartModel<Datum> {
  xValues: ChartXValue[];
  /** Все серии, включая скрытые: легенда показывает и их. */
  series: ChartResolvedSeries<Datum>[];
  visibleSeries: ChartResolvedSeries<Datum>[];
  /** Точки видимых серий одним списком — для домена оси Y. */
  visiblePoints: ChartPoint<Datum>[];
  isEmpty: boolean;
  margin: ChartMargin;
  /** Левый отступ подстраивается под подписи оси Y (не задан явно). */
  autoYAxisWidth: boolean;
  xAxis: ChartXAxisConfig | false;
  yAxis: ChartYAxisConfig | false;
  xScaleType: ChartResolvedXScaleType;
  zero: boolean;
  /** Значения Y опорных линий и полос — расширяют домен оси. */
  annotationValues: readonly number[];
  formatXTick: (value: ChartXValue) => string;
  getTooltipData: (index: number) => ChartTooltipData<Datum> | null;
  toggleSeries: (key: string) => void;
}

const NO_VALUES: readonly number[] = [];

const resolveXTickFormat = (
  axis: ChartXAxisConfig | false,
  xValues: ChartXValue[],
): ((value: ChartXValue) => string) => {
  if (axis !== false && axis.tickFormat) {
    return axis.tickFormat;
  }

  const first = xValues[0];
  const last = xValues[xValues.length - 1];

  if (first instanceof Date && last instanceof Date) {
    return createTimeFormat(first, last);
  }

  return formatChartX;
};

/** Всё, что графику нужно знать о данных до замера ширины. */
export const useChart = <Datum>({
  data,
  series,
  x,
  xScale = "auto",
  xAxis = {},
  yAxis = {},
  margin: marginProp,
  formatValue,
  formatX,
  zero,
  stacked = false,
  referenceLines,
  bands,
}: UseChartOptions<Datum>): ChartModel<Datum> => {
  const { hiddenKeys, toggle } = useSeriesVisibility(series);

  const xValues = useMemo(
    () => data.map((datum, index) => x(datum, index)),
    [data, x],
  );

  const resolvedSeries = useChartSeries({
    data,
    xValues,
    series,
    hiddenKeys,
    stacked,
    formatValue,
  });

  const visibleSeries = useMemo(
    () => resolvedSeries.filter(item => !item.hidden),
    [resolvedSeries],
  );

  const visiblePoints = useMemo(
    () => visibleSeries.flatMap(item => item.points),
    [visibleSeries],
  );

  // Аннотации обычно передают литералом: ключ из значений держит домен стабильным.
  const annotationKey = collectAnnotationValues(referenceLines, bands).join(
    ",",
  );
  const annotationValues = useMemo(
    () => (annotationKey ? annotationKey.split(",").map(Number) : NO_VALUES),
    [annotationKey],
  );

  const margin = useMemo(
    () => resolveChartMargin({ xAxis, yAxis, margin: marginProp }),
    [marginProp, xAxis, yAxis],
  );

  const formatXTick = useMemo(
    () => resolveXTickFormat(xAxis, xValues),
    [xAxis, xValues],
  );

  const getTooltipData = useCallback(
    (index: number) =>
      buildTooltipData({
        data,
        xValues,
        series: visibleSeries,
        index,
        formatX,
        formatTotal: formatValue ?? formatChartValue,
      }),
    [data, formatValue, formatX, visibleSeries, xValues],
  );

  return {
    xValues,
    series: resolvedSeries,
    visibleSeries,
    visiblePoints,
    isEmpty: data.length === 0 || visibleSeries.length === 0,
    margin,
    autoYAxisWidth: yAxis !== false && marginProp?.left === undefined,
    xAxis,
    yAxis,
    xScaleType: resolveXScaleType(xScale, xValues[0]),
    zero,
    annotationValues,
    formatXTick,
    getTooltipData,
    toggleSeries: toggle,
  };
};
