import type { TAgentReleaseSource } from "./tAgentReleaseSource.ts";

/**
 * Сборка агента.
 */
export interface IAgentReleaseArtifactDto {
  os: string;
  arch: string;
  /** Имя файла для `…/agent-link/releases/<file>`. */
  file: string;
  sha256: string;
  signature?: string;
  source: TAgentReleaseSource;
  /** Ссылка на сборку: путь от корня бэкенда `/api/v1/agent-link/releases/<file>` или сам `file`, если он — адрес. */
  url: string;
}
