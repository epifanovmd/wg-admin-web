import type { EWgEndpointMode } from "./eWgEndpointMode.ts";
import type { EWgForwardMode } from "./eWgForwardMode.ts";

export interface WgEndpointDto {
  id: string;
  name: string;
  /** @nullable */
  description: string | null;
  host: string;
  mode: EWgEndpointMode;
  /** @nullable */
  relayNodeId: string | null;
  forwardMode: EWgForwardMode;
  createdAt: string;
  updatedAt: string;
}
