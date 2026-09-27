import { WgDashboardPage } from "@pages/wg-dashboard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: WgDashboardPage,
});
