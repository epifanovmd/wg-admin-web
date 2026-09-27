import { ActivityPage } from "@pages/activity";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/activity")({
  component: ActivityPage,
});
