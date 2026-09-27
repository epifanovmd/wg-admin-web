/**
 * Проба IPIP-туннеля агентом.
 */
export interface IWgTunnelProbe {
  name: string;
  /** @nullable */
  rttMs: number | null;
  lossPercent: number;
}
