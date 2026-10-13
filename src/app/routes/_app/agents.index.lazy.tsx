import { AgentsPage } from "@pages/agents";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/agents/")({
  component: AgentsPage,
});
