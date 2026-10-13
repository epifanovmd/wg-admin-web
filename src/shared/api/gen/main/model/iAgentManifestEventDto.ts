import type { RecordStringAny } from "./recordStringAny.ts";

export interface IAgentManifestEventDto {
  type: string;
  description?: string;
  schema?: RecordStringAny;
}
