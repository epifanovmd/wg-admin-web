import type { AgentDto } from "@shared/api/gen/main/model";
import { Tooltip } from "@shared/ui";
import { FC } from "react";

import { formatAgo, formatMoment } from "../lib/format";
import { AGENT_CONNECTION, agentConnection } from "../lib/status";
import { StatusViewBadge } from "./StatusViewBadge";

interface AgentStatusBadgeProps {
  agent: Pick<AgentDto, "online" | "revoked" | "lastSeenAt">;
}

/** Связь агента с сервером: на связи, нет связи (с последней связью) или отозван. */
export const AgentStatusBadge: FC<AgentStatusBadgeProps> = ({ agent }) => {
  const connection = agentConnection(agent);
  const view = AGENT_CONNECTION[connection];

  if (connection !== "offline" || !agent.lastSeenAt) {
    return <StatusViewBadge view={view} dot />;
  }

  return (
    <Tooltip content={`Последняя связь: ${formatMoment(agent.lastSeenAt)}`}>
      <span className="inline-flex">
        <StatusViewBadge
          view={{
            ...view,
            label: `${view.label} · ${formatAgo(agent.lastSeenAt)}`,
          }}
          dot
        />
      </span>
    </Tooltip>
  );
};
