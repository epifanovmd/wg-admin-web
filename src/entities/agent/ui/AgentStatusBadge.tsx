import type { AgentDto } from "@shared/api/gen/main/model";
import { useTimeSince } from "@shared/lib/hooks";
import { Tooltip } from "@shared/ui";
import { FC } from "react";

import { formatMoment } from "../lib/format";
import { AGENT_CONNECTION, agentConnection } from "../lib/status";
import { StatusViewBadge } from "./StatusViewBadge";

interface AgentStatusBadgeProps {
  agent: Pick<AgentDto, "online" | "revoked" | "lastSeenAt">;
}

/**
 * Связь агента с сервером: на связи, нет связи (с тем, сколько прошло с
 * последней связи — обновляется само) или отозван.
 */
export const AgentStatusBadge: FC<AgentStatusBadgeProps> = ({ agent }) => {
  const connection = agentConnection(agent);
  const view = AGENT_CONNECTION[connection];
  const since = useTimeSince(
    connection === "offline" ? agent.lastSeenAt : null,
  );

  if (!since) return <StatusViewBadge view={view} dot />;

  return (
    <Tooltip content={`Последняя связь: ${formatMoment(agent.lastSeenAt)}`}>
      <span className="inline-flex">
        <StatusViewBadge
          view={{ ...view, label: `${view.label} · ${since}` }}
          dot
        />
      </span>
    </Tooltip>
  );
};
