/**
 * Превращает пустое значение HTML-контрола в `undefined` для Zod-препроцессоров.
 *
 * @example
 * z.preprocess(normalizeEmptyString, z.string().email().optional())
 */
export const normalizeEmptyString = (value: unknown): unknown =>
  value === "" ? undefined : value;
