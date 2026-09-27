/**
 * Маршрут пути `ipip`: `auto` — туннель, а если он не отвечает, напрямую;
 * `tunnel` / `direct` — принудительно.
 */
export type EWgForwardRoute =
  (typeof EWgForwardRoute)[keyof typeof EWgForwardRoute];

export const EWgForwardRoute = {
  auto: "auto",
  tunnel: "tunnel",
  direct: "direct",
} as const;
