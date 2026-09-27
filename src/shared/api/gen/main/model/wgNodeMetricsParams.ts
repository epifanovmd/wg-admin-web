import type { Uuid } from "./uuid.ts";

export type WgNodeMetricsParams = {
  nodeId: Uuid;
  from?: string;
  to?: string;
  stepSec?: number;
};
