import type { EWgInterfaceStatus } from "./eWgInterfaceStatus.ts";
import type { EWgNodeStatus } from "./eWgNodeStatus.ts";
import type { IWgInterfaceReplicaDto } from "./iWgInterfaceReplicaDto.ts";

export interface WgInterfaceDto {
  id: string;
  nodeId: string;
  /**
   * Название ноды (если загружена связь).
   * @nullable
   */
  nodeName: string | null;
  /** Статус ноды (если загружена связь): `created` — агента ещё нет. */
  nodeStatus: EWgNodeStatus | null;
  name: string;
  listenPort: number;
  addressCidr: string;
  /** @nullable */
  addressV6Cidr: string | null;
  publicKey: string;
  /** @nullable */
  dns: string | null;
  /** @nullable */
  mtu: number | null;
  /** @nullable */
  endpointId: string | null;
  /** @nullable */
  endpointPort: number | null;
  /**
   * Итоговый `host:port` для клиентских конфигов.
   * @nullable
   */
  clientEndpoint: string | null;
  natEnabled: boolean;
  /** @nullable */
  customPostUp: string | null;
  /** @nullable */
  customPostDown: string | null;
  enabled: boolean;
  status: EWgInterfaceStatus;
  /** @nullable */
  statusMessage: string | null;
  /** Копии на других нодах (тот же ключ и пиры), по приоритету. */
  replicas: IWgInterfaceReplicaDto[];
  /**
   * Закреплённая для трафика через релей копия; null — авто.
   * @nullable
   */
  activeReplicaNodeId: string | null;
  /**
   * Копия, через которую релей шлёт трафик сейчас (по отчёту агента).
   * @nullable
   */
  servingNodeId: string | null;
  createdAt: string;
  updatedAt: string;
}
