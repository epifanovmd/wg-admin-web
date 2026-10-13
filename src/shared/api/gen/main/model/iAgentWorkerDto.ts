import type { IAgentWorkerDtoPending } from "./iAgentWorkerDtoPending.ts";
import type { IAgentWorkerDtoState } from "./iAgentWorkerDtoState.ts";
import type { IAgentWorkerHealthDto } from "./iAgentWorkerHealthDto.ts";
import type { IAgentWorkerManifestDto } from "./iAgentWorkerManifestDto.ts";

/**
 * Воркер агента.
 */
export interface IAgentWorkerDto {
  name: string;
  version?: string;
  /** Воркер со сборкой с сервера (обновляется `worker.update`). */
  release: boolean;
  state: IAgentWorkerDtoState;
  message?: string;
  restarts: number;
  health?: IAgentWorkerHealthDto;
  /** Плановая замена ждёт, пока воркер занят. */
  pending?: IAgentWorkerDtoPending;
  manifest?: IAgentWorkerManifestDto;
  /** Версия в каталоге сборок новее работающей. */
  updateAvailable?: string;
}
