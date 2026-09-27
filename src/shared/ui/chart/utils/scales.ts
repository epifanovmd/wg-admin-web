import { scaleLinear, scalePoint, scaleTime } from "@visx/scale";
import { bisector, extent } from "@visx/vendor/d3-array";

import type {
  ChartPoint,
  ChartXScaleType,
  ChartXValue,
  ChartYAxisConfig,
} from "../chart.types";

export type ChartResolvedXScaleType = Exclude<ChartXScaleType, "auto">;

export const resolveXScaleType = (
  requested: ChartXScaleType,
  sample: ChartXValue | undefined,
): ChartResolvedXScaleType => {
  if (requested !== "auto") {
    return requested;
  }

  if (sample instanceof Date) {
    return "time";
  }

  return typeof sample === "number" ? "linear" : "point";
};

const toDate = (value: ChartXValue): Date =>
  value instanceof Date ? value : new Date(value);

const toNumber = (value: ChartXValue): number =>
  value instanceof Date ? value.getTime() : Number(value);

/** Ключ сравнения X: даты — по времени, иначе по строковому виду. */
const toXKey = (value: ChartXValue): string =>
  value instanceof Date ? `d:${value.getTime()}` : `${typeof value}:${value}`;

/** Категории отступают от краёв на половину шага, чтобы точки не ложились на оси. */
const POINT_SCALE_PADDING = 0.5;

export interface CreateXScaleOptions {
  type: ChartResolvedXScaleType;
  xValues: ChartXValue[];
  width: number;
}

export type ChartXScale =
  | ReturnType<typeof scaleTime<number>>
  | ReturnType<typeof scaleLinear<number>>
  | ReturnType<typeof scalePoint<number>>;

export interface ChartXScaleResult {
  scale: ChartXScale;
  /** Пиксельная позиция каждой точки данных по X. */
  positions: number[];
  /** Тик оси → значение X: у point-шкалы тики — индексы данных. */
  tickToX: (tick: unknown) => ChartXValue;
  /** Значение X → пиксель; `undefined` — категории нет в данных. */
  xToPosition: (value: ChartXValue) => number | undefined;
}

const toChartXValue = (tick: unknown): ChartXValue => {
  if (
    tick instanceof Date ||
    typeof tick === "number" ||
    typeof tick === "string"
  ) {
    return tick;
  }

  return Number(tick);
};

export const createXScale = ({
  type,
  xValues,
  width,
}: CreateXScaleOptions): ChartXScaleResult => {
  const range: [number, number] = [0, width];

  if (type === "point") {
    const scale = scalePoint<number>({
      domain: xValues.map((_, index) => index),
      range,
      padding: POINT_SCALE_PADDING,
    });

    const keys = xValues.map(toXKey);

    return {
      scale,
      positions: xValues.map((_, index) => scale(index) ?? 0),
      tickToX: tick => xValues[Number(tick)] ?? "",
      xToPosition: value => {
        const index = keys.indexOf(toXKey(value));

        return index === -1 ? undefined : scale(index);
      },
    };
  }

  if (type === "time") {
    const dates = xValues.map(toDate);
    const [min, max] = extent(dates);

    const scale = scaleTime<number>({
      domain: [min ?? new Date(0), max ?? new Date(0)],
      range,
    });

    return {
      scale,
      positions: dates.map(date => scale(date)),
      tickToX: toChartXValue,
      xToPosition: value => scale(toDate(value)),
    };
  }

  const numbers = xValues.map(toNumber);
  const [min, max] = extent(numbers);

  const scale = scaleLinear<number>({
    domain: [min ?? 0, max ?? 0],
    range,
  });

  return {
    scale,
    positions: numbers.map(number => scale(number)),
    tickToX: toChartXValue,
    xToPosition: value => scale(toNumber(value)),
  };
};

export interface CreateYScaleOptions<Datum> {
  points: ChartPoint<Datum>[];
  axis: ChartYAxisConfig | false;
  /** Включать 0 в домен, если ось не сказала иначе. */
  zero: boolean;
  height: number;
  /** Значения аннотаций, которые должны попасть в домен. */
  extraValues?: readonly number[];
}

/** Плоский домен (одно значение) растягивается, иначе линия ложится на край. */
const padFlatDomain = (min: number, max: number): [number, number] => {
  if (min !== max) {
    return [min, max];
  }

  if (min === 0) {
    return [0, 1];
  }

  return [min - Math.abs(min) * 0.1, max + Math.abs(max) * 0.1];
};

export const createYScale = <Datum>({
  points,
  axis,
  zero,
  height,
  extraValues = [],
}: CreateYScaleOptions<Datum>) => {
  const config = axis === false ? undefined : axis;

  const values = points
    .filter(point => point.value !== null)
    .flatMap(point => [point.y0, point.y1]);

  if (config?.zero ?? zero) {
    values.push(0);
  }

  values.push(...extraValues);

  const [min, max] = extent(values);

  return scaleLinear<number>({
    domain: config?.domain ?? padFlatDomain(min ?? 0, max ?? 1),
    range: [height, 0],
    nice: !config?.domain,
  });
};

const positionBisector = bisector<number, number>(position => position);

/** Ближайшая позиция данных к курсору: попадать в саму точку не нужно. */
export const nearestIndex = (positions: number[], x: number): number | null =>
  positions.length === 0 ? null : positionBisector.center(positions, x);
