import { useMemo } from "react";

import type {
  ChartPoint,
  ChartResolvedSeries,
  ChartSeries,
  ChartXValue,
} from "../chart.types";
import { formatChartValue } from "../utils/format";
import { seriesColor } from "../utils/palette";

export interface UseChartSeriesOptions<Datum> {
  data: Datum[];
  xValues: ChartXValue[];
  series: ChartSeries<Datum>[];
  hiddenKeys: ReadonlySet<string>;
  /** Серии складываются друг на друга; пропуск считается нулём. */
  stacked: boolean;
  formatValue?: (value: number) => string;
}

const normalizeValue = (raw: number | null | undefined): number | null =>
  raw === null || raw === undefined || Number.isNaN(raw) ? null : raw;

/**
 * Значения серий считаются один раз, а не на каждый вызов accessor-а.
 * Скрытая серия выпадает и из стека, иначе соседи «повисают» над пустотой.
 */
export const useChartSeries = <Datum>({
  data,
  xValues,
  series,
  hiddenKeys,
  stacked,
  formatValue,
}: UseChartSeriesOptions<Datum>): ChartResolvedSeries<Datum>[] =>
  useMemo(() => {
    const stackTops = new Array<number>(data.length).fill(0);

    const buildPoints = (item: ChartSeries<Datum>): ChartPoint<Datum>[] =>
      data.map((datum, index) => {
        const value = normalizeValue(item.value(datum, index));

        if (!stacked) {
          return {
            index,
            datum,
            x: xValues[index],
            value,
            y0: 0,
            y1: value ?? 0,
          };
        }

        const y0 = stackTops[index];
        const y1 = y0 + (value ?? 0);

        stackTops[index] = y1;

        return { index, datum, x: xValues[index], value, y0, y1 };
      });

    return series.map((item, seriesIndex) => {
      const hidden = hiddenKeys.has(item.key);

      return {
        key: item.key,
        label: item.label ?? item.key,
        color: item.color ?? seriesColor(seriesIndex),
        hidden,
        points: hidden ? [] : buildPoints(item),
        format: item.format ?? formatValue ?? formatChartValue,
      };
    });
  }, [data, formatValue, hiddenKeys, series, stacked, xValues]);
