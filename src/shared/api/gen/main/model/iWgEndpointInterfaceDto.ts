/**
 * Интерфейс, подключённый через точку: куда она ведёт.
 */
export interface IWgEndpointInterfaceDto {
  interfaceId: string;
  interfaceName: string;
  /** Нода интерфейса (основная копия). */
  nodeId: string;
  /** @nullable */
  nodeName: string | null;
  /** Порт клиентов на точке: отдельный порт точки или порт интерфейса. */
  port: number;
  /** Ноды копий интерфейса по приоритету. */
  copyNodeIds: string[];
}
