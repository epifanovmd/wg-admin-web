export type IWgAgentInterfaceStatusReportStatus =
  (typeof IWgAgentInterfaceStatusReportStatus)[keyof typeof IWgAgentInterfaceStatusReportStatus];

export const IWgAgentInterfaceStatusReportStatus = {
  up: "up",
  down: "down",
  error: "error",
  unknown: "unknown",
} as const;
