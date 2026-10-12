import type { AgentAlertDto } from "./agentAlertDto.ts";
import type { IAgentHostDto } from "./iAgentHostDto.ts";
import type { IAgentMetricsPointDto } from "./iAgentMetricsPointDto.ts";
import type { IAgentSessionDto } from "./iAgentSessionDto.ts";
import type { IAgentUpdateInfoDto } from "./iAgentUpdateInfoDto.ts";
import type { IAgentWorkerDto } from "./iAgentWorkerDto.ts";
import type { RecordStringString } from "./recordStringString.ts";

/**
 * Агент, как его видит бэкенд: связь, узел, воркеры (состояние, самочувствие,
 * манифест, настройки), последняя точка метрик, текущие проблемы.
 */
export interface AgentDto {
  id: string;
  name: string;
  labels: RecordStringString;
  online: boolean;
  revoked: boolean;
  /** Время регистрации, мс. */
  enrolledAt: number;
  lastSeenAt?: number;
  connectedAt?: number;
  /** IP последнего подключения. */
  address?: string;
  /** Версия агента. */
  version?: string;
  bootId?: string;
  startedAt?: number;
  host?: IAgentHostDto;
  workers: IAgentWorkerDto[];
  /** Когда пришёл последний `status`, мс. */
  statusAt?: number;
  /** Сколько важных сообщений агента ждут подтверждения. */
  outbox?: number;
  /** Последняя точка метрик. */
  metrics?: IAgentMetricsPointDto;
  /** Новая версия, которую агент нашёл в своём каталоге сборок сам; нет — новее нет или не проверял. */
  update?: IAgentUpdateInfoDto;
  /**
   * Режим обновления агента: `self` — обновляется по команде сервера;
   * `external` (в контейнере) и `disabled` — нет. Нет — агент старше 1.4.
   */
  updateMode?: string;
  /**
   * Как агент поставлен на узел: `systemd`, `user` (без root, служба пользователя),
   * `manual` (без root, без службы); нет — запущен иначе (в контейнере, `--run`).
   */
  install?: string;
  alerts: AgentAlertDto[];
  session?: IAgentSessionDto;
}
