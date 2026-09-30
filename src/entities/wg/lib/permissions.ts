import type { WgPeerDto } from "@shared/api/gen/main/model";

/** Права WG-домена; подписи и группы — в каталоге прав с сервера. */
export const WG_PERMISSIONS = {
  NODE_VIEW: "wg:node:view",
  NODE_CREATE: "wg:node:create",
  NODE_UPDATE: "wg:node:update",
  NODE_DELETE: "wg:node:delete",
  NODE_AGENT: "wg:node:agent",
  NODE_LOGS: "wg:node:logs",
  NODE_PROVISION: "wg:node:provision",
  NODE_ASSIGN: "wg:node:assign",
  ENDPOINT_VIEW: "wg:endpoint:view",
  ENDPOINT_CREATE: "wg:endpoint:create",
  ENDPOINT_UPDATE: "wg:endpoint:update",
  ENDPOINT_DELETE: "wg:endpoint:delete",
  ENDPOINT_ASSIGN: "wg:endpoint:assign",
  FORWARD_VIEW: "wg:forward:view",
  FORWARD_CREATE: "wg:forward:create",
  FORWARD_UPDATE: "wg:forward:update",
  FORWARD_DELETE: "wg:forward:delete",
  FORWARD_ASSIGN: "wg:forward:assign",
  SOCKS_VIEW: "wg:socks:view",
  SOCKS_CREATE: "wg:socks:create",
  SOCKS_UPDATE: "wg:socks:update",
  SOCKS_DELETE: "wg:socks:delete",
  SOCKS_USERS: "wg:socks:users",
  SOCKS_SECRETS: "wg:socks:secrets",
  SOCKS_CLIENTS: "wg:socks:clients",
  SOCKS_ASSIGN: "wg:socks:assign",
  INTERFACE_VIEW: "wg:interface:view",
  INTERFACE_CREATE: "wg:interface:create",
  INTERFACE_UPDATE: "wg:interface:update",
  INTERFACE_DELETE: "wg:interface:delete",
  INTERFACE_CONTROL: "wg:interface:control",
  INTERFACE_MOVE: "wg:interface:move",
  INTERFACE_REPLICAS: "wg:interface:replicas",
  INTERFACE_HOOKS: "wg:interface:hooks",
  INTERFACE_ASSIGN: "wg:interface:assign",
  PEER_VIEW: "wg:peer:view",
  PEER_CREATE: "wg:peer:create",
  PEER_UPDATE: "wg:peer:update",
  PEER_DELETE: "wg:peer:delete",
  PEER_TOGGLE: "wg:peer:toggle",
  PEER_PSK: "wg:peer:psk",
  PEER_ASSIGN: "wg:peer:assign",
  STATS_VIEW: "wg:stats:view",
} as const;

/** Кому пир «свой»: держатель и создатель. */
export const wgPeerOwners = (
  peer: Pick<WgPeerDto, "userId" | "createdById">,
): Array<string | null> => [peer.userId, peer.createdById];

/** Кому сущность «своя»: назначенный владелец и создатель. */
export const wgOwners = (entity: {
  ownerId: string | null;
  createdById: string | null;
}): Array<string | null> => [entity.ownerId, entity.createdById];
