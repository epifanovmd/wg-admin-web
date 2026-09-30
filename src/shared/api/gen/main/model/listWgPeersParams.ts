import type { Uuid } from "./uuid.ts";

export type ListWgPeersParams = {
  interfaceId?: Uuid;
  nodeId?: Uuid;
  userId?: Uuid;
  enabled?: boolean;
  online?: boolean;
  query?: string;
  /**
   * Только свои пиры (держатель или создатель) при любой области прав
   */
  mine?: boolean;
  offset?: number;
  limit?: number;
};
