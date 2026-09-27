/**
 * Измерение «откуда → куда».
 */
export interface IWgMeshCell {
  fromNodeId: string;
  toNodeId: string;
  /** @nullable */
  rttMs: number | null;
  lossPercent: number;
  ts: string;
}
