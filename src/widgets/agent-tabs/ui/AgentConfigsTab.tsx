import { WorkerConfigModal } from "@features/edit-worker-config";
import type { AgentDto } from "@shared/api/gen/main/model";
import { Alert, Empty, Skeleton } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useAgentConfigsVM } from "../model/useAgentConfigsVM";
import { WorkerConfigsCard } from "./WorkerConfigsCard";

interface AgentConfigsTabProps {
  agent: AgentDto;
  /** Можно задавать и удалять настройки. */
  canConfig: boolean;
}

/** Настройки воркеров: по воркеру — ключи из манифеста, версии и итог применения. */
export const AgentConfigsTab: FC<AgentConfigsTabProps> = observer(
  ({ agent, canConfig }) => {
    const vm = useAgentConfigsVM(agent, canConfig);

    if (vm.isLoading && vm.groups.every(group => group.items.length === 0)) {
      return <Skeleton className="h-32 w-full" />;
    }

    return (
      <div className="flex flex-col gap-4">
        {vm.error && (
          <Alert variant="destructive" title="Настройки не загрузились">
            {vm.error.message}
          </Alert>
        )}
        {!agent.online && (
          <Alert variant="info">
            Агент без связи: новые версии он получит при подключении.
          </Alert>
        )}
        {vm.groups.length === 0 ? (
          <Empty
            size="sm"
            title="Воркеров нет"
            description="Настройки бывают у воркеров из настроек агента"
          />
        ) : (
          vm.groups.map(group => (
            <WorkerConfigsCard key={group.worker} group={group} vm={vm} />
          ))
        )}
        <WorkerConfigModal vm={vm.editor} canEdit={canConfig} />
      </div>
    );
  },
);
