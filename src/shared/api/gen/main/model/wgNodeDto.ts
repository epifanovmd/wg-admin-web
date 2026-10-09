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
   * Отображаемое имя владельца.
   * @nullable
   */
  ownerName: string | null;
  /**
   * Создатель ноды.
   * @nullable
   */
  createdById: string | null;
  /**
   * Отображаемое имя создателя.
   * @nullable
   */
  createdByName: string | null;
  name: string;
  /** @nullable */
  description: string | null;
  /** @nullable */
  publicHost: string | null;
  status: EWgNodeStatus;
  /**
   * Пояснение к статусу: что не так с агентом или воркерами.
   * @nullable
   */
  statusMessage: string | null;
  /**
   * Агент ноды (`/api/v1/agents/{agentId}`); нет — агент не установлен.
   * @nullable
   */
  agentId: string | null;
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
  osInfo: IWgNodeOsInfo | null;
  /**
   * IP, с которого агент подключился к бэкенду.
   * @nullable
   */
  agentRemoteIp: string | null;
  /** @nullable */
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}
