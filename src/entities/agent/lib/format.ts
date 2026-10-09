import { formatter } from "@shared/lib/utils";

const toIso = (ms: number): string => new Date(ms).toISOString();

/** Дата и время по миллисекундам: «8 октября 2026, 14:05». */
export const formatMoment = (ms: number | null | undefined): string =>
  ms ? formatter.date.format(toIso(ms)) : "—";

/** Сколько прошло: «3 минуты назад», «вчера». */
export const formatAgo = (ms: number | null | undefined): string =>
  ms ? formatter.date.formatDiff(toIso(ms)) : "—";

/** Время строки журнала и события: «21:45:15». */
export const formatClock = (ms: number): string =>
  new Date(ms).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
