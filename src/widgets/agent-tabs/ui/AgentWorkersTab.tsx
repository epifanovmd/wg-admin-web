import type { AgentDto } from "@shared/api/gen/main/model";
import { useLatestRef } from "@shared/lib/hooks";
import {
  Alert,
  type ExpandingFeatureOptions,
  Table,
  useExpandingFeature,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import { type IWorkerRow, useAgentWorkersVM } from "../model/useAgentWorkersVM";
import { createWorkerColumns } from "./createWorkerColumns";
import { WorkerDetails } from "./WorkerDetails";

interface AgentWorkersTabProps {
  agent: AgentDto;
  /** Можно перезапускать и обновлять воркеры. */
  canManage: boolean;
}

const renderSubComponent: ExpandingFeatureOptions<IWorkerRow>["renderSubComponent"] =
  ({ row }) => <WorkerDetails row={row.original} />;

/** Воркеры агента; раскрытая строка — манифест и метрики воркера. */
export const AgentWorkersTab: FC<AgentWorkersTabProps> = observer(
  ({ agent, canManage }) => {
    const vm = useAgentWorkersVM(agent, canManage);
    const vmRef = useLatestRef(vm);
    const { accessKey } = vm;
    // Действия считаются по строке; при смене прав колонки пересобираются.
    const columns = useMemo(
      () => createWorkerColumns({ vm: vmRef }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [accessKey, vmRef],
    );
    const expanding = useExpandingFeature<IWorkerRow>({ renderSubComponent });
    const features = useMemo(() => [expanding], [expanding]);

    return (
      <div className="flex flex-col gap-4">
        {!agent.online && vm.rows.length > 0 && (
          <Alert variant="warning" title="Агент без связи">
            Состав воркеров — на момент последней связи; что с ними сейчас,
            неизвестно.
          </Alert>
        )}
        <Table
          className="flex-none"
          data={vm.rows}
          columns={columns}
          features={features}
          labels={{
            empty: agent.online
              ? "Воркеров нет — их задают в настройках агента"
              : "Агент без связи: состав воркеров неизвестен",
          }}
          getRowId={row => row.worker.name}
          aria-label="Воркеры агента"
        />
      </div>
    );
  },
);
