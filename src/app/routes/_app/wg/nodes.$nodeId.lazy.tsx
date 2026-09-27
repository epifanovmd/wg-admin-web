import { WgNodeDetailPage } from "@pages/wg-node-detail";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/wg/nodes/$nodeId")({
  component: WgNodeDetailPage,
});
