import type { EWgEndpointMode } from "./eWgEndpointMode.ts";

/**
 * Краткая запись для выпадающих списков.
 */
export interface WgEndpointOptionDto {
  id: string;
  name: string;
  host: string;
  mode: EWgEndpointMode;
}
