import type { IAgentReleaseArtifactDto } from "./iAgentReleaseArtifactDto.ts";
import type { IAgentWorkerArtifactDto } from "./iAgentWorkerArtifactDto.ts";

/**
 * Сборки проекта — `manifest.json` из ``release/` архивов `AGENT_BUNDLE_DIR``
 * (`agent pack --release-out`): версия агента, которым собраны архивы, и
 * сборки воркеров wg и socks. Сборки агента бэкенд не раздаёт: агент берёт их
 * из своего каталога сборок (`update.releases` в `agent.yaml`).
 */
export interface IAgentReleaseManifestDto {
  version: string;
  publicKey?: string;
  artifacts: IAgentReleaseArtifactDto[];
  workers?: IAgentWorkerArtifactDto[];
}
