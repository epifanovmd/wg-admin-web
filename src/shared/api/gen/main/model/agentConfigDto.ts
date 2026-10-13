import type { AgentConfigDtoState } from "./agentConfigDtoState.ts";
import type { IAgentErrorDto } from "./iAgentErrorDto.ts";

/**
 * Ключ настроек воркера и итог его применения.
 */
export interface AgentConfigDto {
  agentId: string;
  worker: string;
  key: string;
  version: number;
  /** `pending` — воркер ещё не применил эту версию. */
  state: AgentConfigDtoState;
  error?: IAgentErrorDto;
  /** Значение — только с правом на настройки. */
  data?: unknown;
  /** Ключ удалён (только в событии сокета `agent:config`). */
  deleted?: boolean;
  /** Изменён, мс. */
  updatedAt: number;
  actor?: string;
}
