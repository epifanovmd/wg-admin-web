/**
 * Измерение «откуда → куда».
 */
export interface IWgMeshCell {
  fromNodeId: string;
  toNodeId: string;
  /**
   * RTT последней пробы, мс; null — последняя проба без ответа.
   * @nullable
   */
  rttMs: number | null;
  /** Потери, %: среднее за окно проб (5 минут). */
  lossPercent: number;
  /** Сколько проб в окне легло в среднее. */
  samples: number;
  /** Время последней пробы. */
  ts: string;
}
