/** Локаль отображения по умолчанию. */
export const DEFAULT_NUMBER_LOCALE = "ru-RU";

/**
 * Формат без разделителя разрядов — для портов, идентификаторов, годов:
 * «51820», а не «51 820».
 *
 * @example <NumberInput formatOptions={PLAIN_NUMBER_FORMAT} />
 */
export const PLAIN_NUMBER_FORMAT: Intl.NumberFormatOptions = {
  useGrouping: false,
};

/** Максимум знаков после запятой, который допускает Intl.NumberFormat. */
const MAX_FRACTION_DIGITS = 20;

/** Пробелы-разделители разрядов, которые встречаются во вставленном тексте. */
const GROUP_SPACES = /[\s\u00a0\u202f]/g;

/** Незавершённый ввод, который ещё не является числом. */
const INCOMPLETE_INPUTS = new Set(["-", ".", ",", "-.", "-,"]);

export const createNumberFormatter = (
  locale: string,
  precision: number | undefined,
  formatOptions: Intl.NumberFormatOptions | undefined,
): Intl.NumberFormat => {
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision ?? MAX_FRACTION_DIGITS,
    ...formatOptions,
  };
  const { minimumFractionDigits = 0, maximumFractionDigits } = options;

  if (
    maximumFractionDigits !== undefined &&
    minimumFractionDigits > maximumFractionDigits
  ) {
    options.maximumFractionDigits = minimumFractionDigits;
  }

  return new Intl.NumberFormat(locale, options);
};

export const getDecimalSeparator = (locale: string): string =>
  new Intl.NumberFormat(locale)
    .formatToParts(1.1)
    .find(part => part.type === "decimal")?.value ?? ".";

/** Шаблон допустимого ввода: знак, цифры и не больше `precision` знаков дроби. */
export const createInputPattern = (
  allowNegative: boolean,
  precision: number | undefined,
): RegExp => {
  const sign = allowNegative ? "-?" : "";
  const fraction = precision === 0 ? "" : `(?:[.,]\\d{0,${precision ?? ""}})?`;

  return new RegExp(`^${sign}\\d*${fraction}$`);
};

export const stripGroupSpaces = (text: string): string =>
  text.replace(GROUP_SPACES, "");

/**
 * Разбирает ввод: `null` — пустое поле, `undefined` — незавершённый ввод
 * («-», «,»), который значение не меняет.
 */
export const parseNumberInput = (text: string): number | null | undefined => {
  if (text === "") return null;
  if (INCOMPLETE_INPUTS.has(text)) return undefined;

  const parsed = Number(text.replace(",", "."));

  return Number.isFinite(parsed) ? parsed : undefined;
};

/** Число в редактируемом виде: без разрядов, с десятичным разделителем локали. */
export const toEditableText = (
  value: number | null,
  decimalSeparator: string,
): string =>
  value === null ? "" : String(value).replace(".", decimalSeparator);

export const countDecimals = (value: number): number => {
  const [, fraction = ""] = String(value).split(".");

  return fraction.length;
};

export const roundTo = (value: number, decimals: number): number =>
  Number(value.toFixed(decimals));

export const clamp = (
  value: number,
  min: number | undefined,
  max: number | undefined,
): number => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value));
