import type { AgentDto } from "@shared/api/gen/main/model";
import { Card } from "@shared/ui";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useWorkerCommandVM } from "../model/useWorkerCommandVM";
import { WorkerCommandForm } from "./WorkerCommandForm";
import { WorkerCommandHistory } from "./WorkerCommandHistory";

interface WorkerCommandConsoleProps {
  agent: AgentDto;
}

/** Консоль команд воркерам агента: команда слева, итоги справа. */
export const WorkerCommandConsole: FC<WorkerCommandConsoleProps> = observer(
  ({ agent }) => {
    const vm = useWorkerCommandVM(agent);

    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Команда" description="Воркеру через агента">
          <WorkerCommandForm vm={vm} />
        </Card>
        <Card title="Итоги" description="Ход и итог — по мере прихода">
          <WorkerCommandHistory
            commands={vm.history}
            onCancel={command => void vm.cancel(command)}
          />
        </Card>
      </div>
    );
  },
);
