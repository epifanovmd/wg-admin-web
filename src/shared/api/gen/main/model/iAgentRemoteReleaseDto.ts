/**
 * Версия агента в удалённом источнике: какая, откуда, когда проверена.
 */
export interface IAgentRemoteReleaseDto {
  version: string;
  /** `github:owner/repo` или адрес сборок (url). */
  from: string;
  /** Когда источник проверен, мс с 1970-01-01. */
  checkedAt: number;
  /** Ключ подписи сборок агента (base64). */
  publicKey?: string;
}
