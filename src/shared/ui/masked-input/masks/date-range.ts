import { format as formatDate, isValid, parse as parseDate } from "date-fns";
import type { FactoryOpts } from "imask";

import { createDateMask, type CreateDateMaskOptions } from "./date";

export interface DateRangeMaskValue {
  from?: Date;
  to?: Date;
}

export interface CreateDateRangeMaskOptions extends CreateDateMaskOptions {
  separator?: string;
}

export const createDateRangeMask = ({
  dateFormat = "dd.MM.yyyy",
  min,
  max,
  separator = " — ",
}: CreateDateRangeMaskOptions = {}): FactoryOpts =>
  ({
    mask: `from${separator}to`,
    blocks: {
      from: createDateMask({ dateFormat, min, max }),
      to: createDateMask({ dateFormat, min, max }),
    },
  }) as FactoryOpts;

export const parseDateRangeValue = (
  value: string,
  {
    dateFormat = "dd.MM.yyyy",
    separator = " — ",
  }: CreateDateRangeMaskOptions = {},
): DateRangeMaskValue => {
  const [fromStr, toStr] = value.split(separator);

  const parseOne = (str?: string): Date | undefined => {
    if (!str) return undefined;
    const parsed = parseDate(str.trim(), dateFormat, new Date());

    if (!isValid(parsed)) return undefined;

    // Round-trip через format → parse: date-fns.parse читает "20" против
    // "yyyy" как 0020 год, поэтому сверяем обратное форматирование.
    return formatDate(parsed, dateFormat) === str.trim() ? parsed : undefined;
  };

  return { from: parseOne(fromStr), to: parseOne(toStr) };
};

export const formatDateRangeValue = (
  value: DateRangeMaskValue | undefined,
  {
    dateFormat = "dd.MM.yyyy",
    separator = " — ",
  }: CreateDateRangeMaskOptions = {},
): string => {
  if (!value?.from) return "";
  if (!value.to) return formatDate(value.from, dateFormat);

  return `${formatDate(value.from, dateFormat)}${separator}${formatDate(value.to, dateFormat)}`;
};
