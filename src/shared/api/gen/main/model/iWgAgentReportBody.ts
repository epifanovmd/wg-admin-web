import type { IWgAgentInterfaceStatusReport } from "./iWgAgentInterfaceStatusReport.ts";
import type { IWgAgentReportBodyOs } from "./iWgAgentReportBodyOs.ts";

/**
 * Отчёт агента о применении конфигурации и системе.
 */
export interface IWgAgentReportBody {
  appliedVersion?: number;
  /** @nullable */
  applyError?: string | null;
  agentVersion?: string;
  /** @nullable */
  wgVersion?: string | null;
  /**
   * sha256 бинаря агента.
   * @nullable
   */
  codeHash?: string | null;
  os?: IWgAgentReportBodyOs;
  interfaces?: IWgAgentInterfaceStatusReport[];
}
