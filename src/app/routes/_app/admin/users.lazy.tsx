import { AdminUsersPage } from "@pages/admin-users";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/admin/users")({
  component: AdminUsersPage,
});
