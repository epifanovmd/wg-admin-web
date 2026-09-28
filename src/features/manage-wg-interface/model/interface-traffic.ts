import type {
  EWgInterfaceStatus,
  EWgNodeStatus,
  WgInterfaceDto,
} from "@shared/api/gen/main/model";

/** Копия интерфейса: основная и реплики по приоритету. */
export interface IInterfaceCopy {
  nodeId: string;
  name: string;
  status: EWgInterfaceStatus;
  message: string | null;
  nodeStatus: EWgNodeStatus | null;
  primary: boolean;
}

export const interfaceCopies = (iface: WgInterfaceDto): IInterfaceCopy[] => [
  {
    nodeId: iface.nodeId,
    name: iface.nodeName ?? "основная",
    status: iface.status,
    message: iface.statusMessage,
    nodeStatus: iface.nodeStatus,
    primary: true,
  },
  ...iface.replicas.map(replica => ({
    nodeId: replica.nodeId,
    name: replica.nodeName ?? replica.nodeId.slice(0, 8),
    status: replica.status,
    message: replica.statusMessage,
    nodeStatus: replica.nodeStatus,
    primary: false,
  })),
];

/** Агента на ноде копии ещё нет: интерфейс там не поднят и статуса нет. */
export const awaitsAgent = (status: EWgNodeStatus | null | undefined) =>
  status === "created" || status === "provisioning";

/**
 * Куда идёт трафик клиентов интерфейса: через релей панели (он выбирает
 * копию) или напрямую на ноду — тогда копии только резерв для переноса.
 */
export type TInterfaceTraffic =
  | {
      kind: "relay";
      relayName: string;
      /** Копия, куда релей шлёт трафик сейчас; null — отчёта ещё нет. */
      servingName: string | null;
      pinned: boolean;
    }
  | { kind: "manual"; endpointName: string | null };

export const interfaceTraffic = (
  iface: WgInterfaceDto,
): TInterfaceTraffic | null => {
  if (iface.endpoint?.mode === "relay") {
    const serving = interfaceCopies(iface).find(
      copy => copy.nodeId === (iface.servingNodeId ?? iface.nodeId),
    );

    return {
      kind: "relay",
      relayName: iface.endpoint.relayNodeName ?? "—",
      servingName: iface.servingNodeId ? (serving?.name ?? null) : null,
      pinned: iface.activeReplicaNodeId !== null,
    };
  }

  return iface.replicas.length > 0
    ? { kind: "manual", endpointName: iface.endpoint?.name ?? null }
    : null;
};
