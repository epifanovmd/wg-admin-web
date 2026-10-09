import type { IAgentReleaseDto } from "@shared/api/gen/main/model";

/** Версия выпуска, до которой можно обновить агента; нельзя — `null`. */
export const agentUpdateTarget = (
  release: IAgentReleaseDto | null,
  agentId: string | null,
): string | null =>
  (agentId &&
    release?.candidates.find(candidate => candidate.agentId === agentId)
      ?.target) ||
  null;

/** Версия выпуска, до которой можно обновить воркер агента; нельзя — `null`. */
export const workerUpdateTarget = (
  release: IAgentReleaseDto | null,
  agentId: string | null,
  worker: string,
): string | null =>
  (agentId &&
    release?.workerCandidates.find(
      candidate => candidate.agentId === agentId && candidate.worker === worker,
    )?.target) ||
  null;

/** Событие `agent:release`: в источнике выпуска появилась новая версия агента. */
export interface IAgentReleaseNotice {
  version: string;
  /** Прежняя версия; нет — выпуск получен впервые после запуска бэкенда. */
  previous?: string;
  /** `github:owner/repo` или база выпуска. */
  from: string;
}

/**
 * Текст уведомления о новой версии агента; первое получение выпуска после
 * запуска бэкенда (без прежней версии) — без уведомления.
 */
export const agentReleaseMessage = (
  notice: IAgentReleaseNotice,
): string | null =>
  notice.previous && notice.previous !== notice.version
    ? `Доступна версия агента ${notice.version} (была ${notice.previous})`
    : null;
