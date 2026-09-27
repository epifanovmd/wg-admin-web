import type {
  ChartAnnotationVariant,
  ChartBand,
  ChartReferenceLine,
} from "../chart.types";

/** Цвет аннотации — токен темы, как у остальных частей графика. */
export const ANNOTATION_COLOR: Record<ChartAnnotationVariant, string> = {
  default: "var(--muted-foreground)",
  destructive: "var(--destructive)",
  success: "var(--success)",
  warning: "var(--warning)",
};

/** Значения Y, которые аннотации требуют видеть в домене оси. */
export const collectAnnotationValues = (
  referenceLines: ChartReferenceLine[] = [],
  bands: ChartBand[] = [],
): number[] => [
  ...referenceLines.flatMap(line =>
    line.y !== undefined && Number.isFinite(line.y) ? [line.y] : [],
  ),
  ...bands.flatMap(band =>
    [band.from, band.to].filter(value => Number.isFinite(value)),
  ),
];
