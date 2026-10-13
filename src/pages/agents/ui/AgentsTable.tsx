import { useLatestRef } from "@shared/lib/hooks";
import { Empty, Table } from "@shared/ui";
import { useNavigate } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import type { AgentsVM } from "../model/useAgentsVM";
import { createAgentColumns } from "./createAgentColumns";

interface AgentsTableProps {
  vm: AgentsVM;
}

/** Таблица агентов; строка открывает агента. */
export const AgentsTable: FC<AgentsTableProps> = observer(({ vm }) => {
  const navigate = useNavigate();
  const vmRef = useLatestRef(vm);
  const { accessKey, release } = vm;
  // Права и обновления считаются по строке; сменились права или сборки — колонки пересобираются.
  const columns = useMemo(
    () => createAgentColumns({ vm: vmRef }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessKey, release, vmRef],
  );

  return (
    <Table
      className="flex-none"
      data={vm.agents}
      columns={columns}
      loading={vm.isLoading}
      error={
        vm.error ? (
          <Empty size="sm" icon="error" title={vm.error.message} />
        ) : undefined
      }
      labels={{
        empty: vm.canEnroll
          ? "Агентов пока нет — нажмите «Установить агента»"
          : "Агентов пока нет",
      }}
      getRowId={agent => agent.id}
      onRowClick={agent =>
        void navigate({ to: "/agents/$agentId", params: { agentId: agent.id } })
      }
      aria-label="Агенты"
    />
  );
});
