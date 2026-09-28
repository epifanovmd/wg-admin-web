import {
  InterfaceReplicasCell,
  InterfaceTrafficSelect,
} from "@features/manage-wg-interface";
import type { WgInterfaceDto } from "@shared/api/gen/main/model";
import { useLatestRef } from "@shared/lib/hooks";
import { createColumnHelper, Empty, Table } from "@shared/ui";
import { Link } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC, RefObject, useMemo } from "react";

import type { RelayedInterfacesVM } from "../model/useRelayedInterfacesVM";

const column = createColumnHelper<WgInterfaceDto>();

const createColumns = (canPin: boolean, vm: RefObject<RelayedInterfacesVM>) => [
  column.display({
    id: "relay",
    header: "Релей",
    size: 150,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium">
          {row.original.endpoint?.relayNodeName ?? "—"}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          udp/{row.original.endpointPort ?? row.original.listenPort}
        </p>
      </div>
    ),
  }),
  column.display({
    id: "target",
    header: "Точка → интерфейс",
    size: 200,
    cell: ({ row }) => (
      <div className="min-w-0 text-xs">
        <p className="truncate">точка {row.original.endpoint?.name ?? "—"}</p>
        <Link
          to="/wg/interfaces/$interfaceId"
          params={{ interfaceId: row.original.id }}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      </div>
    ),
  }),
  column.display({
    id: "copies",
    header: "Куда: копии",
    size: 260,
    cell: ({ row }) => (
      <InterfaceReplicasCell
        iface={row.original}
        canManageReplicas={false}
        dense
      />
    ),
  }),
  column.display({
    id: "traffic",
    header: "Трафик",
    size: 220,
    cell: ({ row }) =>
      row.original.replicas.length > 0 ? (
        <InterfaceTrafficSelect
          iface={row.original}
          disabled={!canPin}
          onPin={(iface, nodeId) => void vm.current.pin(iface, nodeId)}
        />
      ) : (
        <span className="text-xs text-muted-foreground">
          копий нет — переключаться некуда
        </span>
      ),
  }),
];

interface RelayedInterfacesTableProps {
  vm: RelayedInterfacesVM;
}

/** Пересылка точек через релей: куда релей шлёт трафик каждого порта. */
export const RelayedInterfacesTable: FC<RelayedInterfacesTableProps> = observer(
  ({ vm }) => {
    const vmRef = useLatestRef(vm);
    const { canPin, interfaces } = vm;
    const columns = useMemo(
      () => createColumns(canPin, vmRef),
      [canPin, vmRef],
    );

    return (
      <Table
        className="w-full flex-none"
        data={interfaces.items}
        columns={columns}
        loading={interfaces.isLoading}
        error={
          interfaces.error ? (
            <Empty size="sm" icon="error" title={interfaces.error.message} />
          ) : undefined
        }
        labels={{
          empty:
            "Точек через релей пока нет: интерфейс с такой точкой появится здесь автоматически",
        }}
        getRowId={iface => iface.id}
        aria-label="Пересылка точек подключения"
      />
    );
  },
);
