import { AdminAuditPage } from "@pages/admin-audit";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/admin/audit")({
  component: AdminAuditPage,
});
