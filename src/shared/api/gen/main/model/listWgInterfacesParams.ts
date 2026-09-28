import type { Uuid } from "./uuid.ts";

export type ListWgInterfacesParams = {
  nodeId?: Uuid;
  hostNodeId?: Uuid;
  endpointId?: Uuid;
  viaRelay?: boolean;
  enabled?: boolean;
  query?: string;
  offset?: number;
  limit?: number;
};
