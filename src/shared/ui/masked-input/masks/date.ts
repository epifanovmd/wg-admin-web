import { format as formatDate, isValid, parse as parseDate } from "date-fns";
import type { FactoryOpts } from "imask";
import { MaskedRange } from "imask";

export interface CreateDateMaskOptions {
  /** date-fns формат из токенов `dd`, `MM`, `yyyy` и разделителей. */
  dateFormat?: string;
  min?: Date;
  max?: Date;
}

const DEFAULT_MIN = new Date(1900, 0, 1);
const DEFAULT_MAX = new Date(2100, 11, 31);

const TOKEN_TO_BLOCK: Record<string, string> = {
  dd: "d",
  MM: "m",
  yyyy: "Y",
};

/**
 * Строит imask-паттерн из date-fns формата: `dd.MM.yyyy` → `` d{.}`m{.}`Y ``.
 * Разделители — фиксированные символы, бэктик не даёт им «уезжать» при
 * удалении.
 */
export const dateFormatToPattern = (dateFormat: string): string =>
  dateFormat
    .split(/(dd|MM|yyyy)/)
    .filter(Boolean)
    .map((part, index) => {
      const block = TOKEN_TO_BLOCK[part];

      if (!block) return `{${part}}`;

      return index === 0 ? block : `\`${block}`;
    })
    .join("");

export const createDateMask = ({
  dateFormat = "dd.MM.yyyy",
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
}: CreateDateMaskOptions = {}): FactoryOpts =>
  ({
    mask: Date,
    pattern: dateFormatToPattern(dateFormat),
    blocks: {
      d: { mask: MaskedRange, from: 1, to: 31, maxLength: 2 },
      m: { mask: MaskedRange, from: 1, to: 12, maxLength: 2 },
      Y: { mask: MaskedRange, from: min.getFullYear(), to: max.getFullYear() },
    },
    min,
    max,
    format: (date: Date | null) => (date ? formatDate(date, dateFormat) : ""),
    parse: (str: string) => {
      const parsed = parseDate(str, dateFormat, new Date());

      return isValid(parsed) ? parsed : null;
    },
  }) as FactoryOpts;
