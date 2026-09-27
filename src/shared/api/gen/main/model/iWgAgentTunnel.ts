/**
 * IPIP-туннель (конец на этой ноде).
 */
export interface IWgAgentTunnel {
  name: string;
  remoteHost: string;
  localTunnelIp: string;
  remoteTunnelIp: string;
  prefix: number;
  mtu: number;
}
