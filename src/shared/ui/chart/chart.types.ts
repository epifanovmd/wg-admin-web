import type { ReactNode } from "react";

export type ChartXValue = Date | number | string;

/**
 * `auto` — time для дат, linear для чисел, point для строковых категорий.
 */
export type ChartXScaleType = "auto" | "time" | "linear" | "point";

export type ChartCurveType = "linear" | "monotone" | "step";

export type ChartGridMode = "none" | "x" | "y" | "both";

export type ChartLegendPlacement = "top" | "bottom";

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartSeries<Datum> {
  /** Идентификатор серии: ключ React, легенда, тултип, видимость. */
  key: string;
  label?: string;
  /** CSS-цвет. По умолчанию — слот палитры по порядку объявления серии. */
  color?: string;
  /** `null`/`undefined` — пропуск: линия рвётся, в стеке считается нулём. */
  value: (datum: Datum, index: number) => number | null | undefined;
  /** Форматирование значения этой серии в тултипе; перекрывает `formatValue`. */
  format?: (value: number) => string;
  /** Скрыта на первом рендере; легенда может вернуть её обратно. */
  hidden?: boolean;
}

export interface ChartXAxisConfig {
  label?: string;
  tickCount?: number;
  tickFormat?: (value: ChartXValue) => string;
}

export interface ChartYAxisConfig {
  label?: string;
  tickCount?: number;
  tickFormat?: (value: number) => string;
  /** Фиксированный домен; по умолчанию считается по данным и округляется. */
  domain?: [number, number];
  /** Включать 0 в домен; по умолчанию да для областей и нет для линий. */
  zero?: boolean;
}

/** Точка серии в единицах оси Y. `value` = null — пропуск. */
export interface ChartPoint<Datum> {
  index: number;
  datum: Datum;
  x: ChartXValue;
  value: number | null;
  /** Низ сегмента: 0 без стека, накопленная сумма — в стеке. */
  y0: number;
  /** Верх сегмента: само значение без стека. */
  y1: number;
}

export interface ChartResolvedSeries<Datum> {
  key: string;
  label: string;
  color: string;
  hidden: boolean;
  points: ChartPoint<Datum>[];
  format: (value: number) => string;
}

export interface ChartTooltipEntry {
  key: string;
  label: string;
  color: string;
  value: number;
  formatted: string;
}

export interface ChartTooltipData<Datum> {
  index: number;
  datum: Datum;
  x: ChartXValue;
  label: string;
  entries: ChartTooltipEntry[];
  /** Сумма видимых значений — осмысленна для стека. */
  total: number;
  formattedTotal: string;
}

export type ChartAnnotationVariant =
  "default" | "destructive" | "success" | "warning";

/** Опорная линия: `y` — горизонтальная (план, порог), `x` — вертикальная (событие). */
export interface ChartReferenceLine {
  y?: number;
  /** Значение X из данных; для категорий — сама категория. */
  x?: ChartXValue;
  /** Подпись у конца линии: строка или SVG-узел (`<tspan>`). */
  label?: ReactNode;
  variant?: ChartAnnotationVariant;
  dashed?: boolean;
}

/** Горизонтальная полоса между значениями Y — например, целевая зона. */
export interface ChartBand {
  from: number;
  to: number;
  /** Подпись в левом верхнем углу полосы: строка или SVG-узел. */
  label?: ReactNode;
  variant?: ChartAnnotationVariant;
}

export interface ChartBaseProps<Datum> {
  data: Datum[];
  series: ChartSeries<Datum>[];
  x: (datum: Datum, index: number) => ChartXValue;
  xScale?: ChartXScaleType;
  curve?: ChartCurveType;
  height?: number;
  /** Фиксированная ширина; по умолчанию график меряет контейнер сам. */
  width?: number;
  margin?: Partial<ChartMargin>;
  grid?: ChartGridMode;
  xAxis?: ChartXAxisConfig | false;
  yAxis?: ChartYAxisConfig | false;
  legend?: ChartLegendPlacement | false;
  /** Клик по легенде скрывает и возвращает серию. */
  legendToggle?: boolean;
  tooltip?: boolean;
  /** Заменяет содержимое блока значений; подпись X под графиком остаётся. */
  renderTooltip?: (data: ChartTooltipData<Datum>) => ReactNode;
  formatValue?: (value: number) => string;
  /** Подпись позиции X в тултипе. */
  formatX?: (x: ChartXValue, datum: Datum, index: number) => string;
  onPointClick?: (data: ChartTooltipData<Datum>) => void;
  loading?: boolean;
  emptyText?: ReactNode;
  ariaLabel?: string;
  className?: string;
  /** Опорные линии поверх серий; значения `y` попадают в домен оси. */
  referenceLines?: ChartReferenceLine[];
  /** Полосы под сериями; границы попадают в домен оси. */
  bands?: ChartBand[];
}

export interface LineChartProps<Datum> extends ChartBaseProps<Datum> {
  /** Показывать точки всегда, а не только под курсором. */
  showPoints?: boolean;
  strokeWidth?: number;
}

export interface AreaChartProps<Datum> extends ChartBaseProps<Datum> {
  /** Сложить серии друг на друга; тултип показывает и сумму. */
  stacked?: boolean;
  /** Непрозрачность заливки у линии; к низу градиент сходит на нет. */
  fillOpacity?: number;
  strokeWidth?: number;
}
