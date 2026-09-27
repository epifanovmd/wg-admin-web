import { WgStatsPage } from "@pages/wg-stats";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/wg/stats")({
  component: WgStatsPage,
});
