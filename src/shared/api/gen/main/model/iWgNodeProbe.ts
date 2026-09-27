/**
 * Проба другой ноды агентом.
 */
export interface IWgNodeProbe {
  nodeId: string;
  /** @nullable */
  rttMs: number | null;
  lossPercent: number;
}
