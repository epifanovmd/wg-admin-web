import type {
  ChartResolvedSeries,
  ChartTooltipData,
  ChartTooltipEntry,
  ChartXValue,
} from "../chart.types";
import { formatChartX } from "./format";

export interface BuildTooltipDataOptions<Datum> {
  data: Datum[];
  xValues: ChartXValue[];
  series: ChartResolvedSeries<Datum>[];
  index: number;
  formatX?: (x: ChartXValue, datum: Datum, index: number) => string;
  formatTotal: (value: number) => string;
}

/**
 * Один тултип на всю позицию X: курсору не нужно попадать в конкретную
 * линию или заливку, чтобы получить значения всех серий.
 */
export const buildTooltipData = <Datum>({
  data,
  xValues,
  series,
  index,
  formatX,
  formatTotal,
}: BuildTooltipDataOptions<Datum>): ChartTooltipData<Datum> | null => {
  const datum = data[index];

  if (datum === undefined) {
    return null;
  }

  const x = xValues[index];

  const entries = series.flatMap<ChartTooltipEntry>(item => {
    const value = item.points[index]?.value;

    if (value === undefined || value === null) {
      return [];
    }

    return {
      key: item.key,
      label: item.label,
      color: item.color,
      value,
      formatted: item.format(value),
    };
  });

  const total = entries.reduce((sum, entry) => sum + entry.value, 0);

  return {
    index,
    datum,
    x,
    label: formatX ? formatX(x, datum, index) : formatChartX(x),
    entries,
    total,
    formattedTotal: formatTotal(total),
  };
};
