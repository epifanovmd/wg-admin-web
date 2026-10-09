import type { RecordStringUnknown } from "./recordStringUnknown.ts";

/**
 * Тип события воркера в манифесте: другие типы агент не принимает.
 */
export interface IAgentManifestEventDto {
  type: string;
  description?: string;
  /** JSON Schema `data` события. */
  schema?: RecordStringUnknown;
}
