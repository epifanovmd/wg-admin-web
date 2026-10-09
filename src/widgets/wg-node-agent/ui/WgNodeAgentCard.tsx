import {
  agentPlatform,
  AgentStatusBadge,
  agentUpdateTarget,
  formatMoment,
  isAgentLive,
} from "@entities/agent";
import { Alert, Button, Card, InfoField } from "@shared/ui";
import { ArrowUpCircle } from "lucide-react";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import type { IWgNodeAgentContext } from "../model/types";

interface WgNodeAgentCardProps {
  context: IWgNodeAgentContext;
}

/** Агент ноды: связь, версия (и обновление до новой версии), узел, подключение. */
export const WgNodeAgentCard: FC<WgNodeAgentCardProps> = observer(
  ({ context: { agent, release, actions, access } }) => {
    const target = agentUpdateTarget(release, agent.id);
    const updateTo = access.canManage && isAgentLive(agent) ? target : null;

    return (
      <Card
        title="Агент"
        description="Связь с сервером, версия и узел"
        extra={<AgentStatusBadge agent={agent} />}
        contentClassName="flex flex-col gap-3"
      >
        {agent.revoked && (
          <Alert variant="destructive" title="Агент отозван">
            Его ключ больше не принимается. Установите агента заново.
          </Alert>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <InfoField
            label="Версия"
            value={
              agent.version && (
                <span className="flex flex-col items-start gap-1">
                  <span className="font-mono">{agent.version}</span>
                  {target && (
                    <span className="text-xs text-muted-foreground">
                      доступна {target}
                    </span>
                  )}
                </span>
              )
            }
            action={
              updateTo && (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<ArrowUpCircle size={15} />}
                  loading={actions.isBusy("agent")}
                  onClick={() =>
                    void actions.updateAgent(agent.version ?? null, updateTo)
                  }
                >
                  Обновить
                </Button>
              )
            }
          />
          <InfoField
            label="Узел"
            value={
              agent.host && (
                <span className="flex flex-col">
                  <span>{agent.host.hostname}</span>
                  <span className="text-xs text-muted-foreground">
                    {agentPlatform(agent)}
                  </span>
                </span>
              )
            }
          />
          <InfoField
            label="Адрес подключения"
            value={
              agent.address && (
                <span className="font-mono">{agent.address}</span>
              )
            }
          />
          <InfoField
            label={agent.online ? "На связи с" : "Последняя связь"}
            value={
              agent.online
                ? formatMoment(agent.connectedAt)
                : formatMoment(agent.lastSeenAt)
            }
          />
        </div>
      </Card>
    );
  },
);
