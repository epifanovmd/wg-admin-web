import type { EWgForwardPath } from "./eWgForwardPath.ts";
import type { EWgForwardProtocol } from "./eWgForwardProtocol.ts";
import type { EWgForwardRoute } from "./eWgForwardRoute.ts";

export interface ICreateWgForwardBody {
  name: string;
  /** @nullable */
  description?: string | null;
  relayNodeId: string;
  protocol: EWgForwardProtocol;
  listenPort: number;
  /**
   * Нода-цель с агентом (обязательна для пути `ipip`).
   * @nullable
   */
  targetNodeId?: string | null;
  /**
   * Прямой адрес цели; пусто — publicHost ноды-цели.
   * @nullable
   */
  targetHost?: string | null;
  targetPort: number;
  path: EWgForwardPath;
  route?: EWgForwardRoute;
  enabled?: boolean;
}
