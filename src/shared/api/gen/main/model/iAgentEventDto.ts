/**
 * Событие воркера.
 */
export interface IAgentEventDto {
  agentId: string;
  id: string;
  worker: string;
  type: string;
  data?: unknown;
  /** Замечания проверки `data` по схеме события из манифеста воркера. */
  problems?: string[];
  /** Время на узле и приёма, мс. */
  at: number;
  receivedAt: number;
}
