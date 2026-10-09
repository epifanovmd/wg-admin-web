import type { IAgentReleaseDto } from "@shared/api/gen/main/model";

/** Новая версия, до которой можно обновить агента; нельзя — `null`. */
export const agentUpdateTarget = (
  release: IAgentReleaseDto | null,
  agentId: string | null,
): string | null =>
  (agentId &&
    release?.candidates.find(candidate => candidate.agentId === agentId)
      ?.target) ||
  null;

/** Новая версия, до которой можно обновить воркер агента; нельзя — `null`. */
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

/** Событие `agent:release`: там, откуда берутся сборки агента, появилась новая версия. */
export interface IAgentReleaseNotice {
  version: string;
  /** Прежняя версия; нет — сборки получены впервые после запуска бэкенда. */
  previous?: string;
  /** Откуда берутся сборки: `github:owner/repo` (GitHub Releases) или url. */
  from: string;
}

/**
 * Текст уведомления о новой версии агента; первое получение сборок после
 * запуска бэкенда (без прежней версии) — без уведомления.
 */
export const agentReleaseMessage = (
  notice: IAgentReleaseNotice,
): string | null =>
  notice.previous && notice.previous !== notice.version
    ? `Доступна версия агента ${notice.version} (была ${notice.previous})`
    : null;
