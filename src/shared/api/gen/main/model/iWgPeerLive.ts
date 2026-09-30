/**
 * Live-снимок пира.
 */
export interface IWgPeerLive {
  peerId: string;
  interfaceId: string;
  nodeId: string;
  /**
   * Держатель и создатель пира: кому статистика идёт как «своя».
   * @nullable
   */
  userId: string | null;
  /** @nullable */
  createdById: string | null;
  online: boolean;
  /** @nullable */
  lastHandshakeAt: string | null;
  /** @nullable */
  endpoint: string | null;
  rxTotal: number;
  txTotal: number;
  rxBps: number;
  txBps: number;
  ts: string;
}
