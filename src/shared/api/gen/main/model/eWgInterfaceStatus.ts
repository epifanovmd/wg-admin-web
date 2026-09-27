/**
 * Фактическое состояние интерфейса, о котором сообщил агент.
 */
export type EWgInterfaceStatus =
  (typeof EWgInterfaceStatus)[keyof typeof EWgInterfaceStatus];

export const EWgInterfaceStatus = {
  up: "up",
  down: "down",
  error: "error",
  unknown: "unknown",
} as const;
