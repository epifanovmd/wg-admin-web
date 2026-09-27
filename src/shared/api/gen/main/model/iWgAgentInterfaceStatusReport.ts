import type { IWgAgentInterfaceStatusReportStatus } from "./iWgAgentInterfaceStatusReportStatus.ts";

/**
 * Статус интерфейса в отчёте агента.
 */
export interface IWgAgentInterfaceStatusReport {
  name: string;
  status: IWgAgentInterfaceStatusReportStatus;
  /** @nullable */
  message?: string | null;
}
