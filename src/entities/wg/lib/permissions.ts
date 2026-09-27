/** Права WG-домена (бэкенд объявляет их модулями, в KnownPermission их нет). */
export const WG_PERMISSIONS = {
  NODE_VIEW: "wg:node:view",
  NODE_MANAGE: "wg:node:manage",
  NODE_PROVISION: "wg:node:provision",
  ENDPOINT_VIEW: "wg:endpoint:view",
  ENDPOINT_MANAGE: "wg:endpoint:manage",
  FORWARD_VIEW: "wg:forward:view",
  FORWARD_MANAGE: "wg:forward:manage",
  SOCKS_VIEW: "wg:socks:view",
  SOCKS_MANAGE: "wg:socks:manage",
  INTERFACE_VIEW: "wg:interface:view",
  INTERFACE_MANAGE: "wg:interface:manage",
  PEER_VIEW: "wg:peer:view",
  PEER_MANAGE: "wg:peer:manage",
  PEER_OWN: "wg:peer:own",
  STATS_VIEW: "wg:stats:view",
  STATS_OWN: "wg:stats:own",
} as const;
