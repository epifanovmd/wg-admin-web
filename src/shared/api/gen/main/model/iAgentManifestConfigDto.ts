import type { RecordStringAny } from "./recordStringAny.ts";

export interface IAgentManifestConfigDto {
  key: string;
  description?: string;
  /** JSON Schema значения. */
  schema?: RecordStringAny;
}
