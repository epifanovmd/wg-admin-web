import type { EWgPeerDisabledReason } from "./eWgPeerDisabledReason.ts";

export interface WgPeerDto {
  id: string;
  interfaceId: string;
  /** @nullable */
  interfaceName: string | null;
  /** @nullable */
  nodeId: string | null;
  /** @nullable */
  nodeName: string | null;
  /**
   * Держатель пира.
   * @nullable
   */
  userId: string | null;
  /**
   * Создатель пира.
   * @nullable
   */
  createdById: string | null;
  name: string;
  /** @nullable */
  description: string | null;
  publicKey: string;
  /** Можно ли выпустить конфиг/QR (приватный ключ хранится). */
  hasPrivateKey: boolean;
  hasPresharedKey: boolean;
  addressV4: string;
  /** @nullable */
  addressV6: string | null;
  clientAllowedIPs: string;
  /** @nullable */
  clientDns: string | null;
  /** @nullable */
  clientMtu: number | null;
  persistentKeepalive: number;
  enabled: boolean;
  disabledReason: EWgPeerDisabledReason | null;
  /** @nullable */
  expiresAt: string | null;
  /** @nullable */
  lastHandshakeAt: string | null;
  /** @nullable */
  lastEndpoint: string | null;
  /** Handshake свежее 3 минут. */
  isOnline: boolean;
  rxBytesTotal: number;
  txBytesTotal: number;
  createdAt: string;
  updatedAt: string;
}
