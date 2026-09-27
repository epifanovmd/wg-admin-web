import { JobsPage } from "@pages/jobs";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/jobs")({
  component: JobsPage,
});
