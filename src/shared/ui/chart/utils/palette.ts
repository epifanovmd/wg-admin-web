/**
 * Категориальная палитра: порядок слотов фиксирован и не зацикливается.
 * Девятая серия — не сгенерированный оттенок: её сворачивают в «Прочее»,
 * поэтому дальше восьмого слота отдаём нейтральный серый.
 *
 * Значения — токены темы, так что цвета переключаются вместе с ней.
 */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const;

export const seriesColor = (index: number): string =>
  CHART_COLORS[index] ?? "var(--muted-foreground)";
