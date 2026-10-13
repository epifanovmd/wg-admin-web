import { AgentDetailPage } from "@pages/agent-detail";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/agents/$agentId")({
  component: AgentDetailPage,
});
