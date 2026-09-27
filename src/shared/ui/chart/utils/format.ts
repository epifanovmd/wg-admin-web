import { differenceInCalendarDays, format as formatDate } from "date-fns";

import type { ChartXValue, ChartYAxisConfig } from "../chart.types";

const plain = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

const compact = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatChartValue = (value: number): string => plain.format(value);

/** Подписи оси Y укорачиваются: точное число живёт в тултипе. */
export const formatAxisValue = (value: number): string =>
  Math.abs(value) >= 10_000 ? compact.format(value) : plain.format(value);

export const formatChartX = (value: ChartXValue): string =>
  value instanceof Date ? formatDate(value, "d MMM") : String(value);

/**
 * Шаг подписи времени выбирается по охвату домена: за сутки нужны часы,
 * за год — месяцы, иначе подписи повторяются и перестают что-либо значить.
 */
export const createTimeFormat = (
  from: Date,
  to: Date,
): ((value: ChartXValue) => string) => {
  const days = Math.abs(differenceInCalendarDays(to, from));

  const pattern = days <= 2 ? "HH:mm" : days <= 370 ? "d MMM" : "LLL yyyy";

  return value =>
    value instanceof Date ? formatDate(value, pattern) : String(value);
};

/** Форматтер подписей оси Y: собственный из конфига оси или сокращённый. */
export const createYTickFormat = (
  axis: ChartYAxisConfig | false,
): ((value: number) => string) =>
  axis && axis.tickFormat ? axis.tickFormat : formatAxisValue;
