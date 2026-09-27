/**
 * Как релей гонит трафик до целевой ноды.
 */
export type EWgForwardMode =
  (typeof EWgForwardMode)[keyof typeof EWgForwardMode];

export const EWgForwardMode = {
  dnat: "dnat",
  ipip: "ipip",
} as const;
