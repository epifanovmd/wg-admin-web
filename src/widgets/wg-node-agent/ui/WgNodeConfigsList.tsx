import type { AgentDto } from "@shared/api/gen/main/model";
import { Alert, Skeleton } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWgNodeConfigsVM } from "../model/useWgNodeConfigsVM";
import { WorkerConfigsCard } from "./WorkerConfigsCard";

interface WgNodeConfigsListProps {
  agent: AgentDto;
}

/** Настройки воркеров агента ноды: по воркеру — ключи и итог применения. */
export const WgNodeConfigsList: FC<WgNodeConfigsListProps> = observer(
  ({ agent }) => {
    const vm = useWgNodeConfigsVM(agent);

    if (vm.isLoading && vm.groups.every(group => !group.items.length)) {
      return <Skeleton className="h-32 w-full" />;
    }

    return (
      <div className="flex flex-col gap-4">
        {vm.error && (
          <Alert variant="destructive" title="Настройки не загрузились">
            {vm.error.message}
          </Alert>
        )}
        {!agent.online && vm.groups.length > 0 && (
          <Alert variant="info">
            Агент без связи: новые версии настроек он получит при подключении.
          </Alert>
        )}
        {vm.groups.map(group => (
          <WorkerConfigsCard key={group.worker} group={group} />
        ))}
      </div>
    );
  },
);
