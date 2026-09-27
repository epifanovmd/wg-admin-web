import { WgNodesPage } from "@pages/wg-nodes";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/wg/nodes/")({
  component: WgNodesPage,
});
