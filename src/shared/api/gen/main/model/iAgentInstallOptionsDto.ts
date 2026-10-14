import type { IAgentArchiveDto } from "./iAgentArchiveDto.ts";

/**
 * Что можно выдать: адрес бэкенда для агентов и архив агента (нет — `AGENT_BUNDLE_DIR` пуст).
 */
export interface IAgentInstallOptionsDto {
  server: string;
  archive?: IAgentArchiveDto;
}
