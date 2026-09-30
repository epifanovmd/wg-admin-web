import type { EWgNodeStatus } from "./eWgNodeStatus.ts";

export type ListWgNodesParams = {
  query?: string;
  status?: EWgNodeStatus;
  /**
   * Только свои ноды (владелец или создатель) при любой области прав
   */
  mine?: boolean;
  offset?: number;
  limit?: number;
};
