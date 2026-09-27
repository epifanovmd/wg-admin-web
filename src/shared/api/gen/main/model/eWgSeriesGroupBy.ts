/**
 * Группировка серий статистики.
 */
export type EWgSeriesGroupBy =
  (typeof EWgSeriesGroupBy)[keyof typeof EWgSeriesGroupBy];

export const EWgSeriesGroupBy = {
  total: "total",
  node: "node",
  interface: "interface",
  peer: "peer",
} as const;
