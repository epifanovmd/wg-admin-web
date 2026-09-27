import { WgForwardsPage } from "@pages/wg-forwards";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/wg/forwards")({
  component: WgForwardsPage,
});
