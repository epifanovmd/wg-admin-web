import type { EWgInterfaceStatus } from "./eWgInterfaceStatus.ts";

/**
 * Копия интерфейса на другой ноде.
 */
export interface IWgInterfaceReplicaDto {
  nodeId: string;
  /** @nullable */
  nodeName: string | null;
  priority: number;
  status: EWgInterfaceStatus;
  /** @nullable */
  statusMessage: string | null;
}
