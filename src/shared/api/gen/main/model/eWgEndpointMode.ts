/**
 * Режим точки подключения.
 */
export type EWgEndpointMode =
  (typeof EWgEndpointMode)[keyof typeof EWgEndpointMode];

export const EWgEndpointMode = {
  direct: "direct",
  relay: "relay",
} as const;
