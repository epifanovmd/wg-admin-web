export type IAgentWorkerDtoState =
  (typeof IAgentWorkerDtoState)[keyof typeof IAgentWorkerDtoState];

export const IAgentWorkerDtoState = {
  starting: "starting",
  running: "running",
  invalid: "invalid",
  backoff: "backoff",
  stopped: "stopped",
  unknown: "unknown",
} as const;
