import type { IWgNodeSysMetrics } from "./iWgNodeSysMetrics.ts";

/**
 * Live-снимок ноды.
 */
export interface IWgNodeLive {
  nodeId: string;
  interfacesTotal: number;
  peersTotal: number;
  peersOnline: number;
  rxTotal: number;
  txTotal: number;
  rxBps: number;
  txBps: number;
  sys: IWgNodeSysMetrics | null;
  ts: string;
}
