import type {
  AgentCommandDto,
  AgentDto,
  IAgentAlertDto,
  IAgentMetricsPointDto,
  IAgentReleaseDto,
} from "@shared/api/gen/main/model";
import { createInjectDecorator } from "@shared/lib/di";
import type { IHolderError } from "@shared/lib/holders";

import type { IAgentLogEntry } from "../lib/log";

export const IAgentsStore = createInjectDecorator<IAgentsStore>("IAgentsStore");

/** Проблема агента вместе с агентом: в общем списке — ссылка на него. */
export interface IAgentAlert extends IAgentAlertDto {
  agentId: string;
  agentName: string;
}

/** Новая версия агента или воркера, которую можно поставить. */
export interface IAgentUpdateCandidate {
  agentId: string;
  /** Воркер; нет — сам агент. */
  worker?: string;
  current?: string;
  target: string;
}

/**
 * Агенты, их проблемы и сборки воркеров проекта. Список — запросом, изменения —
 * событиями комнаты `agents` (`useAgentsRealtime`); проблемы и новые версии —
 * в самих агентах.
 */
export interface IAgentsStore {
  /** На связи — первыми, дальше по имени. */
  readonly agents: AgentDto[];
  readonly isLoading: boolean;
  readonly error: IHolderError | null;
  /** Проблемы всех агентов. */
  readonly alerts: IAgentAlert[];
  /** Сборки воркеров проекта у сервера. */
  readonly release: IAgentReleaseDto | null;
  /** Кого можно обновить: агенты и воркеры. */
  readonly candidates: IAgentUpdateCandidate[];

  load(): Promise<void>;
  loadRelease(): Promise<void>;
  /** Агент по id с сервера: карточка видна, даже если списка ещё нет. */
  fetch(id: string): Promise<{ error: IHolderError | null }>;
  byId(id: string): AgentDto | undefined;
  alertsOf(agentId: string): IAgentAlert[];
  /** Новая версия агента. */
  updateCandidate(agentId: string): IAgentUpdateCandidate | null;
  /** Новая сборка воркера с сервера. */
  workerCandidate(
    agentId: string,
    worker: string,
  ): IAgentUpdateCandidate | null;
  /** `agent:updated`: добавить или заменить. */
  upsert(agent: AgentDto): void;
  /** `agent:deleted`. */
  remove(id: string): void;
  /** Поставленная пользователем команда ждёт итога (строка воркера показывает ожидание). */
  trackCommand(command: AgentCommandDto): void;
  /** Итог пришёл: команда больше не ждёт. */
  settleCommand(id: string): void;
  /** Ждущая команда агента (воркера — по `worker`) этого типа. */
  pendingCommand(
    agentId: string,
    type: string,
    worker?: string,
  ): AgentCommandDto | undefined;
  reset(): void;
}

/** Событие `agent:metrics` (комната агента). */
export interface IAgentMetricsEvent {
  agentId: string;
  point: IAgentMetricsPointDto;
}

/** Событие `agent:log` (комната агента). */
export interface IAgentLogEvent {
  agentId: string;
  entries: IAgentLogEntry[];
}

/** Событие `agent:command` (комната агента): команда поставлена, идёт или завершена. */
export type IAgentCommandEvent = AgentCommandDto;
