export interface IUpdateWgInterfaceBody {
  name?: string;
  listenPort?: number;
  addressCidr?: string;
  /** @nullable */
  addressV6Cidr?: string | null;
  /** @nullable */
  dns?: string | null;
  /** @nullable */
  mtu?: number | null;
  /** @nullable */
  endpointId?: string | null;
  /** @nullable */
  endpointPort?: number | null;
  natEnabled?: boolean;
  /** @nullable */
  customPostUp?: string | null;
  /** @nullable */
  customPostDown?: string | null;
  /**
   * Закрепить трафик через релей на копии (основная нода или нода реплики);
   * null — авто: основная, при недоступности — следующая по приоритету.
   * @nullable
   */
  activeReplicaNodeId?: string | null;
}
