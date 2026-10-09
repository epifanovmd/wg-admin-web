import type { IAgentReleaseArtifactDto } from "./iAgentReleaseArtifactDto.ts";
import type { IAgentRemoteReleaseDto } from "./iAgentRemoteReleaseDto.ts";
import type { IAgentWorkerArtifactDto } from "./iAgentWorkerArtifactDto.ts";

/**
 * Итоговый манифест сборок: агент и netprobe — из удалённого источника, воркеры
 * проекта (wg, socks) — из `AGENT_RELEASES_DIR`.
 */
export interface IAgentReleaseManifestDto {
  version: string;
  publicKey?: string;
  artifacts: IAgentReleaseArtifactDto[];
  workers?: IAgentWorkerArtifactDto[];
  /** Нет — сборки агента ещё не получены (или источник не задан). */
  remote?: IAgentRemoteReleaseDto;
}
