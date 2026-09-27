import type { IWgSocksAgentConfigUsersItem } from "./iWgSocksAgentConfigUsersItem.ts";

/**
 * SOCKS5-прокси для desired state агента.
 */
export interface IWgSocksAgentConfig {
  id: string;
  listenPort: number;
  certPem: string;
  keyPem: string;
  caPem: string;
  /** SHA-256 допущенных клиентских сертификатов (отозванные — исключены). */
  allowedFingerprints: string[];
  users: IWgSocksAgentConfigUsersItem[];
}
