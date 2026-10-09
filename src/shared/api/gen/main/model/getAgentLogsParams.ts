import type { TAgentWorkerName } from "./tAgentWorkerName.ts";

export type GetAgentLogsParams = {
  worker?: TAgentWorkerName;
  lines?: number;
};
