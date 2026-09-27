import { useLatestRef } from "@shared/lib/hooks";
import { Empty, Table } from "@shared/ui";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import type { WgNodesVM } from "../model/useWgNodesVM";
import { createNodeColumns } from "./createNodeColumns";

interface WgNodesTableProps {
  vm: WgNodesVM;
}

/** Таблица нод; строка открывает ноду. */
export const WgNodesTable: FC<WgNodesTableProps> = observer(({ vm }) => {
  const navigate = useNavigate();
  const vmRef = useLatestRef(vm);
  const { canManage, canProvision } = vm;
  const columns = useMemo(
    () => createNodeColumns({ canManage, canProvision, vm: vmRef }),
    [canManage, canProvision, vmRef],
  );

  return (
    <Table
      className="flex-none"
      data={vm.nodes}
      columns={columns}
      loading={vm.isLoading}
      error={
        vm.error ? (
          <Empty size="sm" icon="error" title={vm.error.message} />
        ) : undefined
      }
      labels={{ empty: "Нод пока нет" }}
      getRowId={node => node.id}
      onRowClick={node =>
        void navigate({ to: "/wg/nodes/$nodeId", params: { nodeId: node.id } })
      }
      aria-label="Ноды WireGuard"
    />
  );
});
