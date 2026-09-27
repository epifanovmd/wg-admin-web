import type { EWgNodeCommandStatus } from "./eWgNodeCommandStatus.ts";
import type { EWgNodeCommandType } from "./eWgNodeCommandType.ts";
import type { IWgNodeCommandPayload } from "./iWgNodeCommandPayload.ts";

export interface WgNodeCommandDto {
  id: string;
  nodeId: string;
  type: EWgNodeCommandType;
  status: EWgNodeCommandStatus;
  payload: IWgNodeCommandPayload;
  output: string;
  /** @nullable */
  exitCode: number | null;
  /** @nullable */
  error: string | null;
  /** @nullable */
  requestedBy: string | null;
  timeoutSec: number;
  /** @nullable */
  startedAt: string | null;
  /** @nullable */
  finishedAt: string | null;
  createdAt: string;
}
