import type { Uuid } from "./uuid.ts";

export type ListWgInterfacesParams = {
  nodeId?: Uuid;
  hostNodeId?: Uuid;
  endpointId?: Uuid;
  viaRelay?: boolean;
  enabled?: boolean;
  query?: string;
  /**
   * Только свои интерфейсы (владелец или создатель) при любой области прав
   */
  mine?: boolean;
  offset?: number;
  limit?: number;
};
