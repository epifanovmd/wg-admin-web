import type { EWgForwardPath } from "./eWgForwardPath.ts";
import type { EWgForwardRoute } from "./eWgForwardRoute.ts";

export interface IUpdateWgForwardBody {
  name?: string;
  /** @nullable */
  description?: string | null;
  listenPort?: number;
  /** @nullable */
  targetNodeId?: string | null;
  /** @nullable */
  targetHost?: string | null;
  targetPort?: number;
  path?: EWgForwardPath;
  route?: EWgForwardRoute;
  enabled?: boolean;
}
