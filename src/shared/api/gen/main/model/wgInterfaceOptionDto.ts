/**
 * Краткая запись для выпадающих списков.
 */
export interface WgInterfaceOptionDto {
  id: string;
  name: string;
  nodeId: string;
  /** @nullable */
  nodeName: string | null;
  addressCidr: string;
}
