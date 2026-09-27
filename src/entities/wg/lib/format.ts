import { formatBytes } from "@shared/lib/utils";

/** Объём трафика: «0 Б», «512 Б», «12.3 МБ», «1.40 ТБ». */
export const formatTraffic = (bytes: number): string => formatBytes(bytes);

/** Скорость: «0 Б/с», «1.2 МБ/с». */
export const formatBps = (bps: number): string => `${formatBytes(bps)}/с`;

/** Момент последнего handshake по-русски: «14 с назад», «5 мин назад». */
export const formatHandshakeAgo = (iso: string | null): string => {
  if (!iso) return "не было";

  const seconds = Math.max(
    0,
    Math.round((Date.now() - Date.parse(iso)) / 1000),
  );

  if (seconds < 60) return `${seconds} с назад`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} мин назад`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} ч назад`;

  return `${Math.round(seconds / 86400)} дн назад`;
};

/** Подпись интерфейса в списках и ссылках: «wg0 · Альфа». */
export const formatInterfaceLabel = (iface: {
  name: string;
  nodeName?: string | null;
}): string =>
  iface.nodeName ? `${iface.name} · ${iface.nodeName}` : iface.name;

type ChartTime = Date | number | string;

/** Время точки live-графика: «21:45:15». */
export const formatChartTime = (value: ChartTime): string =>
  new Date(value).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/**
 * Подпись оси времени графика истории: «21:45», с `withDate` — «27.09, 21:45»
 * (для диапазонов больше суток).
 */
export const formatAxisTime = (value: ChartTime, withDate = false): string =>
  new Date(value).toLocaleString("ru-RU", {
    ...(withDate && { day: "2-digit", month: "2-digit" }),
    hour: "2-digit",
    minute: "2-digit",
  });

/** Момент точки в подсказке графика истории: «27.09.2026, 21:45:15». */
export const formatChartMoment = (value: ChartTime): string =>
  new Date(value).toLocaleString("ru-RU");

/**
 * Домен оси байтов/скорости: при почти нулевых значениях — [0, 1 КБ],
 * иначе автоматический. Без этого нулевой график даёт подписи «0, 0, 1, 1».
 */
export const byteAxisDomain = (
  values: number[],
): [number, number] | undefined =>
  Math.max(0, ...values) < 1024 ? [0, 1024] : undefined;
