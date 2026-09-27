/**
 * Активный маршрут проброса по отчёту агента релея.
 */
export type EWgForwardActiveRoute =
  (typeof EWgForwardActiveRoute)[keyof typeof EWgForwardActiveRoute];

export const EWgForwardActiveRoute = {
  tunnel: "tunnel",
  direct: "direct",
} as const;
