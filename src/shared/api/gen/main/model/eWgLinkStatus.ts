/**
 * Состояние линка: `unknown` — нет свежей пробы.
 */
export type EWgLinkStatus = (typeof EWgLinkStatus)[keyof typeof EWgLinkStatus];

export const EWgLinkStatus = {
  ok: "ok",
  degraded: "degraded",
  down: "down",
  unknown: "unknown",
} as const;
