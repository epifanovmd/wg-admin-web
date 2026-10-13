import { formatter } from "@shared/lib/utils";

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;
const TB = GB * 1024;

/** Объём в байтах: «512 Б», «12.3 МБ», «1.40 ТБ»; пусто — прочерк. */
export const formatSize = (bytes: number | null | undefined): string => {
  if (bytes == null) return "—";
  if (bytes >= TB) return `${(bytes / TB).toFixed(2)} ТБ`;
  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} ГБ`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(1)} МБ`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(1)} КБ`;

  return `${Math.max(0, Math.round(bytes))} Б`;
};

/** Скорость в байтах в секунду: «1.2 МБ/с». */
export const formatRate = (bps: number | null | undefined): string =>
  bps == null ? "—" : `${formatSize(bps)}/с`;

/** Проценты без дробной части: «42%». */
export const formatPercent = (value: number | null | undefined): string =>
  value == null ? "—" : `${Math.round(value)}%`;

/** Число с разделителями разрядов: «12 345». */
export const formatCount = (value: number | null | undefined): string =>
  value == null ? "—" : Math.round(value).toLocaleString("ru-RU");

/** Средняя нагрузка «0.42 / 0.30 / 0.25» (1, 5 и 15 минут). */
export const formatLoad = (load: {
  load1?: number;
  load5?: number;
  load15?: number;
}): string =>
  load.load1 == null
    ? "—"
    : [load.load1, load.load5, load.load15]
        .map(value => (value == null ? "—" : value.toFixed(2)))
        .join(" / ");

/** «Занято из всего»: «1.2 ГБ из 8.00 ГБ». */
export const formatUsage = (
  used: number | null | undefined,
  total: number | null | undefined,
): string =>
  used == null
    ? "—"
    : total
      ? `${formatSize(used)} из ${formatSize(total)}`
      : formatSize(used);

/** Доля занятого, %; без итога — `null`. */
export const usagePercent = (
  used: number | null | undefined,
  total: number | null | undefined,
): number | null => (used == null || !total ? null : (used / total) * 100);

const toIso = (ms: number): string => new Date(ms).toISOString();

/** Дата и время по миллисекундам: «8 октября 2026, 14:05». */
export const formatMoment = (ms: number | null | undefined): string =>
  ms ? formatter.date.format(toIso(ms)) : "—";

/** Сколько прошло: «3 минуты назад», «вчера». */
export const formatAgo = (ms: number | null | undefined): string =>
  ms ? formatter.date.formatDiff(toIso(ms)) : "—";

type ChartTime = Date | number | string;

/** Время точки графика и строки журнала: «21:45:15». */
export const formatClock = (value: ChartTime): string =>
  new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/** Подпись оси истории: «21:45», с датой — «27.09, 21:45». */
export const formatAxisTime = (value: ChartTime, withDate = false): string =>
  new Date(value).toLocaleString("ru-RU", {
    ...(withDate && { day: "2-digit", month: "2-digit" }),
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Домен оси байтов: при почти нулевых значениях — [0, 1 КБ], иначе
 * автоматический. Без этого нулевой график даёт подписи «0, 0, 1, 1».
 */
export const byteAxisDomain = (
  values: number[],
): [number, number] | undefined =>
  Math.max(0, ...values) < KB ? [0, KB] : undefined;
