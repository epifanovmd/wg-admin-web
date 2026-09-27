import type { IWgAgentReleaseInfoHashes } from "./iWgAgentReleaseInfoHashes.ts";

/**
 * Доступная версия агента.
 */
export interface IWgAgentReleaseInfo {
  /**
   * Версия; null — агент на бэкенде не собран.
   * @nullable
   */
  version: string | null;
  /** sha256 бинарей по архитектурам: нода с другим `agentCodeHash` — к обновлению. */
  hashes: IWgAgentReleaseInfoHashes;
}
