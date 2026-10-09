/**
 * Удалённый выпуск агента: версия, источник, когда проверен.
 */
export interface IAgentRemoteReleaseDto {
  version: string;
  /** `github:owner/repo` или база выпуска (url). */
  from: string;
  /** Когда источник проверен, мс с 1970-01-01. */
  checkedAt: number;
  /** Ключ подписи удалённого выпуска (base64). */
  publicKey?: string;
}
