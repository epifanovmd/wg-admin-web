import type { IAgentLogEntryDto } from "./iAgentLogEntryDto.ts";

/**
 * Последние строки журнала.
 */
export interface IAgentLogsDto {
  entries: IAgentLogEntryDto[];
}
