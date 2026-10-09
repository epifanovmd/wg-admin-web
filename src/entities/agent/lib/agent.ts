import type { AgentDto, IAgentWorkerDto } from "@shared/api/gen/main/model";

/** Агент на связи и не отозван: действия и живые данные доступны. */
export const isAgentLive = (agent: Pick<AgentDto, "online" | "revoked">) =>
  agent.online && !agent.revoked;

/** ОС узла: «linux · amd64». */
export const agentPlatform = (agent: AgentDto): string | null =>
  [agent.host?.os, agent.host?.arch].filter(Boolean).join(" · ") || null;

/** Воркеры агента; встроенный (метрики узла) — в конце. */
export const agentWorkers = (agent: AgentDto): IAgentWorkerDto[] => [
  ...agent.workers.filter(worker => !worker.builtin),
  ...agent.workers.filter(worker => worker.builtin),
];

/** Воркеры из настроек агента: у них бывают маршруты, настройки и журнал. */
export const configuredWorkers = (agent: AgentDto): IAgentWorkerDto[] =>
  agent.workers.filter(worker => !worker.builtin);
