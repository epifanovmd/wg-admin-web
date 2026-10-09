import { agentWorkers, isAgentLive, workerUpdateTarget } from "@entities/agent";
import type { IAgentWorkerDto } from "@shared/api/gen/main/model";

import type { IWgNodeAgentContext } from "./types";

/** Действия над воркером в строке таблицы. */
export interface IWorkerRowAccess {
  canRestart: boolean;
  /** Версия выпуска, до которой можно обновить; нельзя — `null`. */
  updateTo: string | null;
  /** Воркер занят или замена ждёт его — можно заменить сразу. */
  canReplaceNow: boolean;
}

/**
 * Воркеры агента ноды: состояние, самочувствие, версия, отложенная замена;
 * действия — через ноду (кроме встроенного воркера: он часть агента).
 */
export const useWgNodeWorkersVM = ({
  agent,
  release,
  actions,
  access,
}: IWgNodeAgentContext) => {
  const updateTargetOf = (worker: IAgentWorkerDto) =>
    worker.release ? workerUpdateTarget(release, agent.id, worker.name) : null;

  const accessOf = (worker: IAgentWorkerDto): IWorkerRowAccess => {
    const can = access.canManage && isAgentLive(agent) && !worker.builtin;

    return {
      canRestart: can,
      updateTo: can ? updateTargetOf(worker) : null,
      canReplaceNow: can && (!!worker.pending || !!worker.health?.busy),
    };
  };

  return {
    agent,
    workers: agentWorkers(agent),
    actions,
    accessOf,
    updateTargetOf,
    /** Меняется вместе с правом — колонки таблицы пересобираются по нему. */
    accessKey: String(access.canManage),
  };
};

export type WgNodeWorkersVM = ReturnType<typeof useWgNodeWorkersVM>;
