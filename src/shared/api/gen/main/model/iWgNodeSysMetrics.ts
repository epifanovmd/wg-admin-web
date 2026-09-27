import type { IWgNicRate } from "./iWgNicRate.ts";

export interface IWgNodeSysMetrics {
  cpuPercent: number;
  load1: number;
  load5?: number;
  load15?: number;
  /** Сетевые интерфейсы хоста без lo и Docker. */
  nics?: IWgNicRate[];
  /** @nullable */
  conntrackCount?: number | null;
  /** @nullable */
  conntrackMax?: number | null;
  memUsedBytes: number;
  memTotalBytes: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  uptimeSec: number;
}
