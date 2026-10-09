import type { IAgentReleaseManifestDto } from "./iAgentReleaseManifestDto.ts";
import type { IAgentUpdateCandidateDto } from "./iAgentUpdateCandidateDto.ts";
import type { IAgentWorkerUpdateCandidateDto } from "./iAgentWorkerUpdateCandidateDto.ts";

/**
 * Сборки агента и кого можно обновить.
 */
export interface IAgentReleaseDto {
  /** `null` — каталог сборок не задан или пуст. */
  manifest: IAgentReleaseManifestDto | null;
  candidates: IAgentUpdateCandidateDto[];
  workerCandidates: IAgentWorkerUpdateCandidateDto[];
}
