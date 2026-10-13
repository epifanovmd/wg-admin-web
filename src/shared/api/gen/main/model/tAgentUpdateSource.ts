/**
 * Откуда новая версия агента: `agent` — агент нашёл её в своём каталоге сборок сам.
 */
export type TAgentUpdateSource =
  (typeof TAgentUpdateSource)[keyof typeof TAgentUpdateSource];

export const TAgentUpdateSource = {
  agent: "agent",
} as const;
