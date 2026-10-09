import type { IAgentErrorDto } from "@shared/api/gen/main/model";

import type { IAgentLogEntry } from "../lib/log";

/** Событие `agent:log` (комната агента). */
export interface IAgentLogEvent {
  agentId: string;
  entries: IAgentLogEntry[];
}

/** Событие `agent:action` (комната агента): итог встроенного действия. */
export interface IAgentActionEvent {
  id: string;
  agentId: string;
  /** `worker.restart` | `worker.update` | `agent.update` | `agent.rotateKey` | `agent.logs`. */
  name: string;
  args?: Record<string, unknown>;
  actor?: string;
  /** `done` | `failed`. */
  status: string;
  result?: unknown;
  error?: IAgentErrorDto;
  createdAt: number;
  finishedAt: number;
  /** Итог отложенной замены воркера (ждала окончания работы). */
  deferred?: boolean;
}
