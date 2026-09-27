import type { IWgOverviewInterfaces } from "./iWgOverviewInterfaces.ts";
import type { IWgOverviewNodes } from "./iWgOverviewNodes.ts";
import type { IWgOverviewPeers } from "./iWgOverviewPeers.ts";

/**
 * Сводка для дашборда.
 */
export interface IWgOverview {
  nodes: IWgOverviewNodes;
  interfaces: IWgOverviewInterfaces;
  peers: IWgOverviewPeers;
  rxTotal: number;
  txTotal: number;
  rxBps: number;
  txBps: number;
  ts: string;
}
