import type { EWgForwardActiveRoute } from "./eWgForwardActiveRoute.ts";

export type IWgAgentStatsBodyForwardsItem = {
  /** Копия интерфейса, обслуживающая трафик (для пробросов точек). */
  activeNodeId?: string;
  activeRoute: EWgForwardActiveRoute;
  id: string;
};
