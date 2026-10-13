import {
  AGENT_PERMISSIONS,
  AgentAlertsCard,
  agentInstallLabel,
  agentSubtitle,
  agentVersion,
} from "@entities/agent";
import { PermissionGate } from "@entities/user";
import {
  Alert,
  PageEmpty,
  PageHeader,
  PageLayout,
  PageLoader,
} from "@shared/ui";
import { AgentTabs, type TAgentTab } from "@widgets/agent-tabs";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";

import { useAgentDetailVM } from "../model/useAgentDetailVM";
import { AgentHeaderActions } from "./AgentHeaderActions";
import { AgentTitle } from "./AgentTitle";

interface AgentDetailProps {
  agentId: string;
}

/** Агент: шапка с действиями, проблемы и вкладки агента. */
export const AgentDetail: FC<AgentDetailProps> = observer(({ agentId }) => {
  const vm = useAgentDetailVM(agentId);
  const { agent } = vm;
  // Журнал — на всю высоту экрана с прокруткой внутри, остальное — страница.
  const [tab, setTab] = useState<TAgentTab>("overview");

  return (
    <PageLayout
      fill={tab === "logs"}
      header={
        agent && (
          <PageHeader
            title={<AgentTitle agent={agent} />}
            subtitle={[
              agentSubtitle(agent),
              agentVersion(agent) && `агент ${agentVersion(agent)}`,
              agentInstallLabel(agent.install),
            ]
              .filter(Boolean)
              .join(" · ")}
            actions={<AgentHeaderActions vm={vm} agent={agent} />}
          />
        )
      }
    >
      <PermissionGate permission={AGENT_PERMISSIONS.VIEW}>
        {!agent ? (
          vm.isError ? (
            <PageEmpty icon="error" title="Агент не найден" />
          ) : (
            <PageLoader label="Загрузка агента…" />
          )
        ) : (
          <>
            {agent.revoked && (
              <Alert variant="destructive" title="Агент отозван">
                Его ключ больше не принимается. Вернуть агента можно только
                новой регистрацией на узле.
              </Alert>
            )}
            <AgentAlertsCard alerts={vm.alerts} />
            <AgentTabs
              agent={agent}
              access={vm.access}
              value={tab}
              onValueChange={setTab}
            />
          </>
        )}
      </PermissionGate>
    </PageLayout>
  );
});
