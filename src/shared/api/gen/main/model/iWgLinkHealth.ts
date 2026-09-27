import type { EWgLinkRole } from "./eWgLinkRole.ts";
import type { EWgLinkStatus } from "./eWgLinkStatus.ts";

/**
 * Здоровье IPIP-линка релея глазами ноды.
 */
export interface IWgLinkHealth {
  linkId: string;
  role: EWgLinkRole;
  counterpartNodeId: string;
  /** @nullable */
  counterpartName: string | null;
  tunnelName: string;
  /** @nullable */
  rttMs: number | null;
  /** @nullable */
  lossPercent: number | null;
  status: EWgLinkStatus;
  /** @nullable */
  ts: string | null;
}
