import type { EWgEndpointMode } from "./eWgEndpointMode.ts";
import type { EWgEndpointRoute } from "./eWgEndpointRoute.ts";
import type { EWgForwardMode } from "./eWgForwardMode.ts";

export interface IUpdateWgEndpointBody {
  name?: string;
  /** @nullable */
  description?: string | null;
  host?: string;
  mode?: EWgEndpointMode;
  /** @nullable */
  relayNodeId?: string | null;
  forwardMode?: EWgForwardMode;
  route?: EWgEndpointRoute;
}
