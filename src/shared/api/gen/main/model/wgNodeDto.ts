import type { EWgNodeStatus } from "./eWgNodeStatus.ts";
import type { IWgNodeOsInfo } from "./iWgNodeOsInfo.ts";

export interface WgNodeDto {
  id: string;
  /**
   * Назначенный владелец ноды.
   * @nullable
   */
  ownerId: string | null;
  /**
   * Создатель ноды.
   * @nullable
   */
  createdById: string | null;
  name: string;
  /** @nullable */
  description: string | null;
  /** @nullable */
  publicHost: string | null;
  status: EWgNodeStatus;
  /** Есть ли выпущенный ключ агента. */
  hasAgentKey: boolean;
  configVersion: number;
  appliedVersion: number;
  /** Конфигурация на ноде актуальна. */
  inSync: boolean;
  /** @nullable */
  applyError: string | null;
  /** @nullable */
  agentVersion: string | null;
  /** @nullable */
  wgVersion: string | null;
  /**
   * sha256 бинаря агента; сравнивается с `release` для обновления.
   * @nullable
   */
  agentCodeHash: string | null;
  osInfo: IWgNodeOsInfo | null;
  /**
   * IP, с которого агент обращается к бэкенду.
   * @nullable
   */
  agentRemoteIp: string | null;
  /** @nullable */
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}
