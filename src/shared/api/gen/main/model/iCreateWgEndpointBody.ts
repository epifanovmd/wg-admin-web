import type { EWgEndpointMode } from "./eWgEndpointMode.ts";
import type { EWgEndpointRoute } from "./eWgEndpointRoute.ts";
import type { EWgForwardMode } from "./eWgForwardMode.ts";

export interface ICreateWgEndpointBody {
  name: string;
  /** @nullable */
  description?: string | null;
  /** Хост (IP/домен), который попадает в клиентские конфиги. */
  host: string;
  mode: EWgEndpointMode;
  /**
   * Обязательна для mode=relay.
   * @nullable
   */
  relayNodeId?: string | null;
  forwardMode?: EWgForwardMode;
  /** Маршрут при IPIP: по умолчанию `auto` (запасной прямой путь). */
  route?: EWgEndpointRoute;
}
