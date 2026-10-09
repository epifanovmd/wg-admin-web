import type { RecordStringUnknown } from "./recordStringUnknown.ts";

/**
 * Тип задачи воркера в манифесте (`POST /jobs`).
 */
export interface IAgentManifestJobDto {
  type: string;
  description?: string;
  /** JSON Schema `data` задачи. */
  schema?: RecordStringUnknown;
}
