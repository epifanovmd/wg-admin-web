import type { EWgNodeCommandType } from "./eWgNodeCommandType.ts";
import type { IWgNodeCommandPayload } from "./iWgNodeCommandPayload.ts";

/**
 * Императивная команда агенту.
 */
export interface IWgAgentCommand {
  id: string;
  type: EWgNodeCommandType;
  payload: IWgNodeCommandPayload;
  /** Срок выполнения: дольше команда считается просроченной (timeout). */
  timeoutSec: number;
}
