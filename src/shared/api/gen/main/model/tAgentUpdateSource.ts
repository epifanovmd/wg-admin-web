/**
 * Откуда новая версия агента: `server` — сборки сервера (источник сборок агента), `agent` —
 * агент нашёл её в своём каталоге сборок сам.
 */
export type TAgentUpdateSource =
  (typeof TAgentUpdateSource)[keyof typeof TAgentUpdateSource];

export const TAgentUpdateSource = {
  server: "server",
  agent: "agent",
} as const;
