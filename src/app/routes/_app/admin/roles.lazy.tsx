import { AdminRolesPage } from "@pages/admin-roles";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/admin/roles")({
  component: AdminRolesPage,
});
