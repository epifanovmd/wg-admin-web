/**
 * Откуда сборка: `remote` — удалённый источник сборок агента (GitHub или
 * `AGENT_RELEASES_URL`), `local` — каталог воркеров проекта
 * (``release/` архивов `AGENT_BUNDLE_DIR``).
 */
export type TAgentReleaseSource =
  (typeof TAgentReleaseSource)[keyof typeof TAgentReleaseSource];

export const TAgentReleaseSource = {
  remote: "remote",
  local: "local",
} as const;
