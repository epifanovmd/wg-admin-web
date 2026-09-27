import type { Uuid } from "./uuid.ts";

export type ListWgInterfacesParams = {
  nodeId?: Uuid;
  endpointId?: Uuid;
  enabled?: boolean;
  query?: string;
  offset?: number;
  limit?: number;
};
