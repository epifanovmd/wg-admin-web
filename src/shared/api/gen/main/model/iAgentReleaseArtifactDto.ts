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
  /** Ссылка на сборку в источнике или путь от корня бэкенда. */
  url: string;
}
