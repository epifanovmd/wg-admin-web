/**
 * Откуда сборка: `local` — сборки проекта (`release/` архивов `AGENT_BUNDLE_DIR`).
 */
export type TAgentReleaseSource =
  (typeof TAgentReleaseSource)[keyof typeof TAgentReleaseSource];

export const TAgentReleaseSource = {
  local: "local",
} as const;
