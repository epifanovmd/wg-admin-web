import type { EWgNodeStatus } from "./eWgNodeStatus.ts";

export type ListWgNodesParams = {
  query?: string;
  status?: EWgNodeStatus;
  offset?: number;
  limit?: number;
};
