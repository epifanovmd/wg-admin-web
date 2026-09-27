import type { Uuid } from "./uuid.ts";

export type ListWgPeersParams = {
  interfaceId?: Uuid;
  nodeId?: Uuid;
  userId?: Uuid;
  enabled?: boolean;
  online?: boolean;
  query?: string;
  offset?: number;
  limit?: number;
};
