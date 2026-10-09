/** Значение как JSON с отступами; `undefined` — пустая строка. */
export const formatJson = (value: unknown): string =>
  value === undefined ? "" : JSON.stringify(value, null, 2);

/** Значение одной строкой для списков и подписей. */
export const formatJsonInline = (value: unknown): string =>
  value === undefined ? "" : JSON.stringify(value);
