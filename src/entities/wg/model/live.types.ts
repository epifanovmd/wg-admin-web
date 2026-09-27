/** Payload'ы live-событий сокета WG-домена (см. модуль wg-stats бэкенда). */

export type {
  IWgInterfaceLive,
  IWgNicRate,
  IWgNodeLive,
  IWgNodeSysMetrics,
  IWgOverview as IWgOverviewLive,
  IWgPeerLive,
} from "@shared/api/gen/main/model";

/** Точка live-графика скорости. */
export interface ISpeedPoint {
  ts: number;
  rxBps: number;
  txBps: number;
}

/** Сколько точек держит live-график (как короткий ряд бэкенда). */
export const SPEED_WINDOW_POINTS = 600;
/** Какой отрезок времени показывает live-график. */
export const SPEED_WINDOW_MS = 10 * 60_000;

/** Точки последних `SPEED_WINDOW_MS` от самой новой, не больше `max`. */
const trimSpeedPoints = (points: ISpeedPoint[], max: number): ISpeedPoint[] => {
  const latest = points.at(-1)?.ts ?? 0;

  return points
    .filter(point => point.ts > latest - SPEED_WINDOW_MS)
    .slice(-max);
};

/**
 * Новая точка live-графика; точка не новее последней (повтор, опоздавшее
 * событие) отбрасывается.
 */
export const pushSpeedPoint = (
  points: ISpeedPoint[],
  next: ISpeedPoint,
  max = SPEED_WINDOW_POINTS,
): ISpeedPoint[] => {
  const last = points.at(-1);

  if (last && next.ts <= last.ts) return points;

  return trimSpeedPoints([...points, next], max);
};

/**
 * История с сервера и точки, пришедшие сокетом: история — основа, из живых
 * остаются только более новые.
 */
export const mergeSpeedPoints = (
  history: ISpeedPoint[],
  live: ISpeedPoint[],
  max = SPEED_WINDOW_POINTS,
): ISpeedPoint[] => {
  const last = history.at(-1)?.ts ?? -Infinity;

  return trimSpeedPoints(
    [...history, ...live.filter(point => point.ts > last)],
    max,
  );
};
