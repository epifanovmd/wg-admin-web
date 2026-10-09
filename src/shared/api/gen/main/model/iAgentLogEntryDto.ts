import type { RecordStringUnknown } from "./recordStringUnknown.ts";
import type { TAgentLogLevel } from "./tAgentLogLevel.ts";

/**
 * Запись журнала агента или воркера.
 */
export interface IAgentLogEntryDto {
  /** Время, мс. */
  at: number;
  level: TAgentLogLevel;
  /** `agent` или имя воркера. */
  source: string;
  msg: string;
  attrs?: RecordStringUnknown;
}
