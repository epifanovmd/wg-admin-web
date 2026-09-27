/**
 * Точка короткой истории скорости (кольцевой ряд последних минут).
 */
export interface IWgSpeedPoint {
  /** Момент сбора (unix ms). */
  ts: number;
  rxBps: number;
  txBps: number;
}
