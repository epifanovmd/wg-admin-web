/**
 * Точка серии.
 */
export interface IWgSeriesPointDto {
  ts: string;
  /** Трафик за шаг, байты. */
  rxBytes: number;
  txBytes: number;
  /** Средняя скорость за шаг, Б/с. */
  rxBps: number;
  txBps: number;
  /** Пиковая скорость внутри шага, Б/с. */
  rxPeakBps: number;
  txPeakBps: number;
}
