import type { RecordStringAny } from "./recordStringAny.ts";

export interface IAgentManifestCommandDto {
  type: string;
  description?: string;
  /** JSON Schema аргументов. */
  schema?: RecordStringAny;
  /** JSON Schema итога. */
  result?: RecordStringAny;
}
