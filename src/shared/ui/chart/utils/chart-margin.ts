import type {
  ChartMargin,
  ChartXAxisConfig,
  ChartYAxisConfig,
} from "../chart.types";
import {
  AXIS_LABEL_MARGIN,
  DEFAULT_CHART_MARGIN,
  HIDDEN_AXIS_MARGIN,
} from "./chart-constants";

export interface ResolveChartMarginOptions {
  xAxis: ChartXAxisConfig | false;
  yAxis: ChartYAxisConfig | false;
  margin?: Partial<ChartMargin>;
}

const resolveAxisMargin = (
  axis: ChartXAxisConfig | ChartYAxisConfig | false,
  base: number,
): number => {
  if (axis === false) {
    return HIDDEN_AXIS_MARGIN;
  }

  return axis.label ? base + AXIS_LABEL_MARGIN : base;
};

/** Явный `margin` перекрывает вычисленный по осям. */
export const resolveChartMargin = ({
  xAxis,
  yAxis,
  margin,
}: ResolveChartMarginOptions): ChartMargin => ({
  ...DEFAULT_CHART_MARGIN,
  left: resolveAxisMargin(yAxis, DEFAULT_CHART_MARGIN.left),
  bottom: resolveAxisMargin(xAxis, DEFAULT_CHART_MARGIN.bottom),
  ...margin,
});

/** Средняя ширина символа подписи оси (11px, системный шрифт). */
const TICK_CHAR_WIDTH = 6.6;

/** Зазор между подписью и областью графика плюс запас на округление. */
const TICK_LABEL_GAP = 14;

/**
 * Левый отступ под подписи оси Y: не меньше базового и не уже самой
 * длинной подписи — иначе длинные значения («1,5 млн ₽») обрезаются.
 */
export const resolveYAxisWidth = (labels: string[], base: number): number => {
  const longest = labels.reduce((max, label) => Math.max(max, label.length), 0);

  return Math.max(base, Math.ceil(longest * TICK_CHAR_WIDTH + TICK_LABEL_GAP));
};
