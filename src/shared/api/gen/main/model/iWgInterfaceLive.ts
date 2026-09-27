/**
 * Live-снимок интерфейса.
 */
export interface IWgInterfaceLive {
  interfaceId: string;
  nodeId: string;
  name: string;
  peersTotal: number;
  peersOnline: number;
  rxTotal: number;
  txTotal: number;
  rxBps: number;
  txBps: number;
  ts: string;
}
