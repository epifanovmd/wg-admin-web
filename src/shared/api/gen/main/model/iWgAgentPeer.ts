/**
 * Пир в серверном конфиге интерфейса.
 */
export interface IWgAgentPeer {
  publicKey: string;
  /** @nullable */
  presharedKey: string | null;
  allowedIps: string;
}
