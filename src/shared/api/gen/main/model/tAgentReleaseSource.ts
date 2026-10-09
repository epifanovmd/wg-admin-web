/**
 * Откуда сборка: `remote` — удалённый источник выпуска агента (GitHub или
 * `AGENT_RELEASES_URL`), `local` — каталог воркеров проекта
 * (`AGENT_RELEASES_DIR`).
 */
export type TAgentReleaseSource =
  (typeof TAgentReleaseSource)[keyof typeof TAgentReleaseSource];

export const TAgentReleaseSource = {
  remote: "remote",
  local: "local",
} as const;
