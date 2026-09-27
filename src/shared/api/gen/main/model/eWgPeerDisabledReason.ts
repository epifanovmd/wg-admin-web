/**
 * Причина, по которой пир выключен.
 */
export type EWgPeerDisabledReason =
  (typeof EWgPeerDisabledReason)[keyof typeof EWgPeerDisabledReason];

export const EWgPeerDisabledReason = {
  manual: "manual",
  expired: "expired",
} as const;
