import type { EWgEndpointMode } from "./eWgEndpointMode.ts";

/**
 * Точка подключения интерфейса: через что к нему приходят клиенты.
 */
export interface IWgInterfaceEndpointDto {
  name: string;
  /** `relay` — трафик пересылает релей панели и переключает на копии. */
  mode: EWgEndpointMode;
  /** @nullable */
  relayNodeId: string | null;
  /** @nullable */
  relayNodeName: string | null;
}
