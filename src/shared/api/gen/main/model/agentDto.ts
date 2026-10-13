import type { IAgentAlertDto } from "./iAgentAlertDto.ts";
import type { IAgentHostDto } from "./iAgentHostDto.ts";
import type { IAgentMetricsPointDto } from "./iAgentMetricsPointDto.ts";
import type { IAgentWorkerDto } from "./iAgentWorkerDto.ts";
import type { RecordStringString } from "./recordStringString.ts";

/**
 * Агент.
 */
export interface AgentDto {
  id: string;
  name: string;
  labels: RecordStringString;
  online: boolean;
  revoked: boolean;
  version?: string;
  /** self | external | disabled. */
  updateMode?: string;
  /** Как поставлен: systemd | user | manual. */
  install?: string;
  host?: IAgentHostDto;
  remoteIp?: string;
  /** Отметки времени, мс: регистрация, последняя связь, запуск программы агента. */
  enrolledAt: number;
  lastSeenAt?: number;
  startedAt?: number;
  /** Новая версия агента в его каталоге сборок. */
  updateAvailable?: string;
  /** Номер желаемого и применённый агентом. */
  desiredRev: number;
  appliedRev?: number;
  /** Итоги и события, ждущие отправки на узле. */
  outbox?: number;
  workers: IAgentWorkerDto[];
  metrics?: IAgentMetricsPointDto;
  alerts: IAgentAlertDto[];
}
