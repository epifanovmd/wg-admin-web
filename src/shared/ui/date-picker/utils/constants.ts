import type { Locale } from "date-fns";
import { ru } from "date-fns/locale";

import type { WeekStartsOn } from "../types";

/** Локаль по умолчанию для всех календарей и форматирования дат. */
export const DATE_LOCALE: Locale = ru;

/** Размер страницы в режиме выбора года (сетка 3×4). */
export const YEARS_PER_PAGE = 12;

/** Формат полной даты для `aria-label` ячеек. */
export const FULL_DATE_FORMAT = "d MMMM yyyy";

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1);

export const resolveWeekStartsOn = (
  locale: Locale,
  override?: WeekStartsOn,
): WeekStartsOn => override ?? locale.options?.weekStartsOn ?? 1;

/** Названия месяцев в именительном падеже, с заглавной буквы. */
export const getMonthNames = (locale: Locale): string[] =>
  Array.from({ length: 12 }, (_, index) =>
    capitalize(
      locale.localize.month(
        index as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11,
        {
          width: "wide",
          context: "standalone",
        },
      ),
    ),
  );

/** Короткие названия дней недели, начиная с `weekStartsOn`. */
export const getWeekdayNames = (
  locale: Locale,
  weekStartsOn: WeekStartsOn,
): string[] =>
  Array.from({ length: 7 }, (_, index) =>
    capitalize(
      locale.localize.day(((weekStartsOn + index) % 7) as WeekStartsOn, {
        width: "short",
      }),
    ),
  );
