/**
 * Маршрут пересылки через IPIP-туннель: с запасным прямым путём до той же
 * ноды или без него. При DNAT не используется — туннеля нет.
 */
export type EWgEndpointRoute =
  (typeof EWgEndpointRoute)[keyof typeof EWgEndpointRoute];

export const EWgEndpointRoute = {
  auto: "auto",
  tunnel: "tunnel",
  direct: "direct",
} as const;
