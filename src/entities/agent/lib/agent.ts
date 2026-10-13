import type { AgentDto, IAgentWorkerDto } from "@shared/api/gen/main/model";

import { isWorkerTroubled } from "./status";

/** Версия программы агента; не выходил на связь — `null`. */
export const agentVersion = (agent: AgentDto): string | null =>
  agent.version ?? null;

/** Имя узла агента. */
export const agentHostname = (agent: AgentDto): string | null =>
  agent.host?.hostname ?? null;

/** ОС узла: «linux · amd64». */
export const agentPlatform = (agent: AgentDto): string | null =>
  [agent.host?.os, agent.host?.arch].filter(Boolean).join(" · ") || null;

/** Узел одной строкой: имя, ОС, адрес. */
export const agentSubtitle = (agent: AgentDto): string =>
  [agentHostname(agent), agentPlatform(agent), agent.remoteIp]
    .filter(Boolean)
    .join(" · ") || "агент ещё не выходил на связь";

/** Метки «ключ=значение». */
export const agentLabels = (labels: Record<string, string>): string[] =>
  Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => (value ? `${key}=${value}` : key));

/** Агент на связи и не отозван: действия и живые данные доступны. */
export const isAgentLive = (agent: AgentDto): boolean =>
  agent.online && !agent.revoked;

/** Воркеры агента по имени. */
export const agentWorkers = (agent: AgentDto): IAgentWorkerDto[] =>
  [...agent.workers].sort((a, b) => a.name.localeCompare(b.name));

/** Воркер по имени. */
export const workerOf = (
  agent: AgentDto,
  name: string,
): IAgentWorkerDto | undefined =>
  agent.workers.find(worker => worker.name === name);

/** Сколько воркеров и сколько из них не в порядке. */
export const workersSummary = (
  agent: AgentDto,
): { total: number; troubled: number } => ({
  total: agent.workers.length,
  troubled: agent.workers.filter(isWorkerTroubled).length,
});

/** Агенты на связи — первыми, дальше по имени. */
export const onlineAgentFirst = (a: AgentDto, b: AgentDto): number =>
  Number(isAgentLive(b)) - Number(isAgentLive(a)) ||
  a.name.localeCompare(b.name);

/** Ключ проблемы: агент, вид, воркер и ключ настроек. */
export const alertKey = (alert: {
  agentId: string;
  kind: string;
  worker?: string;
  key?: string;
}): string =>
  [alert.agentId, alert.kind, alert.worker ?? "", alert.key ?? ""].join("/");
