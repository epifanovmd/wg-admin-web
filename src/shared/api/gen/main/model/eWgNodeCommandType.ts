/**
 * Типы команд, исполняемых агентом на ноде.
 */
export type EWgNodeCommandType =
  (typeof EWgNodeCommandType)[keyof typeof EWgNodeCommandType];

export const EWgNodeCommandType = {
  "interface-restart": "interface-restart",
  "agent-logs": "agent-logs",
  "agent-update": "agent-update",
} as const;
