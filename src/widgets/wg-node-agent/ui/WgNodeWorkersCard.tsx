import type { IAgentWorkerDto } from "@shared/api/gen/main/model";
import { useLatestRef } from "@shared/lib/hooks";
import {
  Alert,
  Card,
  type ExpandingFeatureOptions,
  Table,
  useExpandingFeature,
} from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC, useMemo } from "react";

import type { IWgNodeAgentContext } from "../model/types";
import { useWgNodeWorkersVM } from "../model/useWgNodeWorkersVM";
import { createWorkerColumns } from "./createWorkerColumns";
import { WorkerDetails } from "./WorkerDetails";

interface WgNodeWorkersCardProps {
  context: IWgNodeAgentContext;
}

const renderSubComponent: ExpandingFeatureOptions<IAgentWorkerDto>["renderSubComponent"] =
  ({ row }) => <WorkerDetails worker={row.original} />;

/** Воркеры агента ноды; раскрытая строка — манифест воркера. */
export const WgNodeWorkersCard: FC<WgNodeWorkersCardProps> = observer(
  ({ context }) => {
    const vm = useWgNodeWorkersVM(context);
    const vmRef = useLatestRef(vm);
    const { accessKey } = vm;
    // Действия считаются по строке; при смене прав колонки пересобираются.
    const columns = useMemo(
      () => createWorkerColumns({ vm: vmRef }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [accessKey, vmRef],
    );
    const expanding = useExpandingFeature<IAgentWorkerDto>({
      renderSubComponent,
    });
    const features = useMemo(() => [expanding], [expanding]);

    return (
      <Card
        title="Воркеры"
        description="wg — интерфейсы, туннели и пробросы; socks — прокси"
        contentClassName="flex flex-col gap-4"
      >
        {!vm.agent.online && vm.workers.length > 0 && (
          <Alert variant="warning" title="Агент без связи">
            Состав воркеров — на момент последней связи; что с ними сейчас,
            неизвестно.
          </Alert>
        )}
        <Table
          className="flex-none"
          data={vm.workers}
          columns={columns}
          features={features}
          labels={{
            empty: vm.agent.online
              ? "Воркеров нет — их задают при установке агента"
              : "Агент без связи: состав воркеров неизвестен",
          }}
          getRowId={worker => worker.name}
          aria-label="Воркеры агента"
        />
      </Card>
    );
  },
);
