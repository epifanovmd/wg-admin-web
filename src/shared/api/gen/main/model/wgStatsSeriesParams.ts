import type { EWgSeriesGroupBy } from "./eWgSeriesGroupBy.ts";
import type { Uuid } from "./uuid.ts";

export type WgStatsSeriesParams = {
  from?: string;
  to?: string;
  stepSec?: number;
  groupBy?: EWgSeriesGroupBy;
  nodeId?: Uuid;
  interfaceId?: Uuid;
  peerId?: Uuid;
  userId?: Uuid;
};
