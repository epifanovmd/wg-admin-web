import type { AgentCommandDtoStatus } from "./agentCommandDtoStatus.ts";
import type { IAgentErrorDto } from "./iAgentErrorDto.ts";

/**
 * Команда агенту и её итог.
 */
export interface AgentCommandDto {
  id: string;
  agentId: string;
  type: string;
  /** Для команды воркеру — воркер и тип его команды. */
  worker?: string;
  workerType?: string;
  args?: unknown;
  status: AgentCommandDtoStatus;
  ok?: boolean;
  result?: unknown;
  error?: IAgentErrorDto;
  /** Ход долгой команды, 0..1. */
  progress?: number;
  progressText?: string;
  actor?: string;
  /** Поставлена и завершена, мс. */
  createdAt: number;
  finishedAt?: number;
}
