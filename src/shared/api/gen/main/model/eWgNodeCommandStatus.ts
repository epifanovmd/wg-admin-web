export type EWgNodeCommandStatus =
  (typeof EWgNodeCommandStatus)[keyof typeof EWgNodeCommandStatus];

export const EWgNodeCommandStatus = {
  pending: "pending",
  running: "running",
  succeeded: "succeeded",
  failed: "failed",
  timeout: "timeout",
} as const;
