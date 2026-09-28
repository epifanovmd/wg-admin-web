import { useLatestRef } from "@shared/lib/hooks";
import { Empty, Table } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import type { WgEndpointsVM } from "../model/useWgEndpointsVM";
import { createEndpointColumns } from "./createEndpointColumns";

interface WgEndpointsTableProps {
  vm: WgEndpointsVM;
}

/** Таблица точек подключения. */
export const WgEndpointsTable: FC<WgEndpointsTableProps> = observer(
  ({ vm }) => {
    const vmRef = useLatestRef(vm);
    const { canUpdate, canDelete, endpoints, relayNodeName } = vm;
    const columns = useMemo(
      () =>
        createEndpointColumns({
          canUpdate,
          canDelete,
          relayNodeName,
          vm: vmRef,
        }),
      [canUpdate, canDelete, relayNodeName, vmRef],
    );

    return (
      <Table
        className="w-full flex-none"
        data={endpoints.items}
        columns={columns}
        loading={endpoints.isLoading}
        error={
          endpoints.error ? (
            <Empty size="sm" icon="error" title={endpoints.error.message} />
          ) : undefined
        }
        labels={{
          empty:
            "Точек пока нет — клиенты подключаются напрямую к публичному хосту ноды",
        }}
        getRowId={endpoint => endpoint.id}
        aria-label="Точки подключения"
      />
    );
  },
);
