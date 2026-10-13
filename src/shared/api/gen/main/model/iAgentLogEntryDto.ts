import type { RecordStringAny } from "./recordStringAny.ts";

export interface IAgentLogEntryDto {
  at: number;
  level: string;
  /** `agent` или имя воркера. */
  source: string;
  msg: string;
  attrs?: RecordStringAny;
}
