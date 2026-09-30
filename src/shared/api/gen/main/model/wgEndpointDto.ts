import type { EWgEndpointMode } from "./eWgEndpointMode.ts";
import type { EWgEndpointRoute } from "./eWgEndpointRoute.ts";
import type { EWgForwardMode } from "./eWgForwardMode.ts";
import type { IWgEndpointInterfaceDto } from "./iWgEndpointInterfaceDto.ts";

export interface WgEndpointDto {
  id: string;
  /**
   * Назначенный владелец точки.
   * @nullable
   */
  ownerId: string | null;
  /**
   * Создатель точки.
   * @nullable
   */
  createdById: string | null;
  name: string;
  /** @nullable */
  description: string | null;
  host: string;
  mode: EWgEndpointMode;
  /** @nullable */
  relayNodeId: string | null;
  forwardMode: EWgForwardMode;
  /** Маршрут при IPIP: запасной прямой путь до той же ноды (`auto`) или нет. */
  route: EWgEndpointRoute;
  /** Интерфейсы, подключённые через точку, — куда она ведёт. */
  interfaces: IWgEndpointInterfaceDto[];
  createdAt: string;
  updatedAt: string;
}
