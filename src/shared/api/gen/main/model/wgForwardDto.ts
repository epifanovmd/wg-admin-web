import type { EWgForwardActiveRoute } from "./eWgForwardActiveRoute.ts";
import type { EWgForwardPath } from "./eWgForwardPath.ts";
import type { EWgForwardProtocol } from "./eWgForwardProtocol.ts";
import type { EWgForwardRoute } from "./eWgForwardRoute.ts";

export interface WgForwardDto {
  id: string;
  /**
   * Назначенный владелец проброса.
   * @nullable
   */
  ownerId: string | null;
  /**
   * Создатель проброса.
   * @nullable
   */
  createdById: string | null;
  name: string;
  /** @nullable */
  description: string | null;
  relayNodeId: string;
  /** @nullable */
  relayNodeName: string | null;
  protocol: EWgForwardProtocol;
  listenPort: number;
  /** @nullable */
  targetNodeId: string | null;
  /** @nullable */
  targetNodeName: string | null;
  /** @nullable */
  targetHost: string | null;
  targetPort: number;
  path: EWgForwardPath;
  route: EWgForwardRoute;
  enabled: boolean;
  /** Маршрут по последнему отчёту агента релея; null — отчёта ещё нет. */
  activeRoute: EWgForwardActiveRoute | null;
  createdAt: string;
  updatedAt: string;
}
