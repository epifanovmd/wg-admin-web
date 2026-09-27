export interface IUpdateWgPeerBody {
  name?: string;
  /** @nullable */
  description?: string | null;
  clientAllowedIPs?: string;
  /** @nullable */
  clientDns?: string | null;
  /** @nullable */
  clientMtu?: number | null;
  persistentKeepalive?: number;
  /** @nullable */
  expiresAt?: string | null;
}
