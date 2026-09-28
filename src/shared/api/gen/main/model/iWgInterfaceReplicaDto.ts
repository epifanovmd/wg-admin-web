import type { EWgInterfaceStatus } from "./eWgInterfaceStatus.ts";
import type { EWgNodeStatus } from "./eWgNodeStatus.ts";

/**
 * Копия интерфейса на другой ноде.
 */
export interface IWgInterfaceReplicaDto {
  nodeId: string;
  /** @nullable */
  nodeName: string | null;
  /** Статус ноды копии: `created` — агента ещё нет, копия ждёт его. */
  nodeStatus: EWgNodeStatus | null;
  priority: number;
  status: EWgInterfaceStatus;
  /** @nullable */
  statusMessage: string | null;
}
