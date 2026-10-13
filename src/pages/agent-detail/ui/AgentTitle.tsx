import { AgentStatusBadge, workersSummary } from "@entities/agent";
import type { AgentDto } from "@shared/api/gen/main/model";
import { Badge } from "@shared/ui";
import { FC } from "react";

interface AgentTitleProps {
  agent: AgentDto;
}

/** Имя агента со связью и неполадками воркеров. */
export const AgentTitle: FC<AgentTitleProps> = ({ agent }) => {
  const { troubled } = workersSummary(agent);

  return (
    <span className="flex flex-wrap items-center gap-3">
      {agent.name}
      <AgentStatusBadge agent={agent} />
      {agent.online && troubled > 0 && (
        <Badge variant="warning">воркеров не в порядке: {troubled}</Badge>
      )}
    </span>
  );
};
