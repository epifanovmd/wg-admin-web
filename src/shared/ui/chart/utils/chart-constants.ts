import type { ChartMargin } from "../chart.types";

export const DEFAULT_CHART_HEIGHT = 280;

export const DEFAULT_CHART_MARGIN: ChartMargin = {
  top: 12,
  right: 16,
  bottom: 28,
  left: 48,
};

/** Отступ под скрытой осью: место нужно только под кольцо точки. */
export const HIDDEN_AXIS_MARGIN = 8;

/** Дополнительное место под подпись оси. */
export const AXIS_LABEL_MARGIN = 18;

export const DEFAULT_X_TICK_COUNT = 6;

export const DEFAULT_Y_TICK_COUNT = 5;

export const LINE_WIDTH = 2;

export const AREA_FILL_OPACITY = 0.4;

export const POINT_RADIUS = 4;

export const POINT_RING = 2;

/** Сдвиг блока значений от точки, чтобы он не закрывал её. */
export const TOOLTIP_OFFSET = 12;

/** Подпись X прижимается к нижнему краю области графика. */
export const TOOLTIP_LABEL_OFFSET = 14;
