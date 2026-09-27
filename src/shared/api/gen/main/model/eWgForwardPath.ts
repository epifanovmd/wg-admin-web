/**
 * Путь до цели: напрямую (DNAT на её адрес) или через IPIP-туннель.
 */
export type EWgForwardPath =
  (typeof EWgForwardPath)[keyof typeof EWgForwardPath];

export const EWgForwardPath = {
  direct: "direct",
  ipip: "ipip",
} as const;
