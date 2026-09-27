import type { IWgAgentPeer } from "./iWgAgentPeer.ts";

/**
 * Желаемое состояние интерфейса на ноде.
 */
export interface IWgAgentInterface {
  name: string;
  enabled: boolean;
  listenPort: number;
  addressCidr: string;
  /** @nullable */
  addressV6Cidr: string | null;
  privateKey: string;
  /** @nullable */
  mtu: number | null;
  /** Пресет NAT (masquerade через egress-интерфейс ноды). */
  natEnabled: boolean;
  /** @nullable */
  customPostUp: string | null;
  /** @nullable */
  customPostDown: string | null;
  peers: IWgAgentPeer[];
}
