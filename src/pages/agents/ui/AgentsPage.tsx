import {
  AGENT_PERMISSIONS,
  AgentAlertsCard,
  AlertAgentLink,
} from "@entities/agent";
import { PermissionGate } from "@entities/user";
import { InstallAgentModal } from "@features/enroll-agent";
import { Button, PageHeader, PageLayout } from "@shared/ui";
import { HardDriveDownload } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { useAgentsVM } from "../model/useAgentsVM";
import { AgentsTable } from "./AgentsTable";

export const AgentsPage: FC = observer(() => {
  const vm = useAgentsVM();

  return (
    <PageLayout
      header={
        <PageHeader
          title="Агенты"
          subtitle="Программы на узлах: связь, воркеры, нагрузка, обновление"
          actions={
            vm.canEnroll && (
              <Button
                leftIcon={<HardDriveDownload size={15} />}
                onClick={vm.install.openDialog}
              >
                Установить агента
              </Button>
            )
          }
        />
      }
    >
      <PermissionGate permission={AGENT_PERMISSIONS.VIEW}>
        <AgentAlertsCard
          alerts={vm.alerts}
          renderAgent={alert => <AlertAgentLink alert={alert} />}
        />
        <AgentsTable vm={vm} />
      </PermissionGate>
      <InstallAgentModal vm={vm.install} />
    </PageLayout>
  );
});
