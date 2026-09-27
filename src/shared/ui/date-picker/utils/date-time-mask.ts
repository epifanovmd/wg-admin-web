import { format as formatDate, isValid, parse as parseDate } from "date-fns";
import type { FactoryOpts } from "imask";
import { MaskedRange } from "imask";

export interface CreateDateTimeMaskOptions {
  /** date-fns формат из токенов `dd`, `MM`, `yyyy`, `HH`, `mm` и разделителей. */
  dateFormat?: string;
  min?: Date;
  max?: Date;
}

const DEFAULT_MIN = new Date(1900, 0, 1);
const DEFAULT_MAX = new Date(2100, 11, 31, 23, 59);

const TOKEN_TO_BLOCK: Record<string, string> = {
  dd: "d",
  MM: "m",
  yyyy: "Y",
  HH: "H",
  mm: "M",
};

/**
 * imask-паттерн из date-fns формата с временем: `dd.MM.yyyy HH:mm` →
 * `` d{.}`m{.}`Y{ }`H{:}`M ``. Разделители фиксированы, бэктик не даёт им
 * «уезжать» при удалении.
 */
const dateTimeFormatToPattern = (dateFormat: string): string =>
  dateFormat
    .split(/(dd|MM|yyyy|HH|mm)/)
    .filter(Boolean)
    .map((part, index) => {
      const block = TOKEN_TO_BLOCK[part];

      if (!block) return `{${part}}`;

      return index === 0 ? block : `\`${block}`;
    })
    .join("");

/** Маска даты со временем: `typedValue` — Date с часами и минутами. */
export const createDateTimeMask = ({
  dateFormat = "dd.MM.yyyy HH:mm",
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
}: CreateDateTimeMaskOptions = {}): FactoryOpts =>
  ({
    mask: Date,
    pattern: dateTimeFormatToPattern(dateFormat),
    blocks: {
      d: { mask: MaskedRange, from: 1, to: 31, maxLength: 2 },
      m: { mask: MaskedRange, from: 1, to: 12, maxLength: 2 },
      Y: { mask: MaskedRange, from: min.getFullYear(), to: max.getFullYear() },
      H: { mask: MaskedRange, from: 0, to: 23, maxLength: 2 },
      M: { mask: MaskedRange, from: 0, to: 59, maxLength: 2 },
    },
    min,
    max,
    format: (date: Date | null) => (date ? formatDate(date, dateFormat) : ""),
    parse: (str: string) => {
      const parsed = parseDate(str, dateFormat, new Date());

      return isValid(parsed) ? parsed : null;
    },
  }) as FactoryOpts;
