import type { EWgNodeStatus } from "./eWgNodeStatus.ts";

/**
 * Краткая запись для выпадающих списков.
 */
export interface WgNodeOptionDto {
  id: string;
  name: string;
  status: EWgNodeStatus;
}
