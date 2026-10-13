export type IAgentAlertDtoKind =
  (typeof IAgentAlertDtoKind)[keyof typeof IAgentAlertDtoKind];

export const IAgentAlertDtoKind = {
  offline: "offline",
  workerDown: "workerDown",
  workerInvalid: "workerInvalid",
  workerUnhealthy: "workerUnhealthy",
  configFailed: "configFailed",
} as const;
