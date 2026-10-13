import type { RecordStringAny } from "./recordStringAny.ts";

export interface IAgentManifestRequestDto {
  type: string;
  description?: string;
  schema?: RecordStringAny;
  response?: RecordStringAny;
}
