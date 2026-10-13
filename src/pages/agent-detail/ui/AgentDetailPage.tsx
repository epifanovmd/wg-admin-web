import { useParams } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { FC } from "react";

import { AgentDetail } from "./AgentDetail";

/** Маршрут агента: другой агент — новое состояние страницы, без данных прежнего. */
export const AgentDetailPage: FC = observer(() => {
  const { agentId } = useParams({ from: "/_app/agents/$agentId" });

  return <AgentDetail key={agentId} agentId={agentId} />;
});
