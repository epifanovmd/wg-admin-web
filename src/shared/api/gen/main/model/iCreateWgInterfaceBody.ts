export interface ICreateWgInterfaceBody {
  nodeId: string;
  name: string;
  listenPort: number;
  /** Адрес интерфейса с подсетью пиров, например `10.0.0.1/24`. */
  addressCidr: string;
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
  /**
   * Только с правом `wg:interface:hooks`.
   * @nullable
   */
  customPostUp?: string | null;
  /** @nullable */
  customPostDown?: string | null;
  enabled?: boolean;
  /**
   * Назначенный владелец; другой пользователь — только с правом назначения.
   * @nullable
   */
  ownerId?: string | null;
}
