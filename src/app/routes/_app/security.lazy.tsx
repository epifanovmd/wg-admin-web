import { SecurityPage } from "@pages/security";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/security")({
  component: SecurityPage,
});
