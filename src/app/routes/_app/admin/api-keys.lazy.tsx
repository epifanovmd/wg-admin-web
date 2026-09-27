import { AdminApiKeysPage } from "@pages/admin-api-keys";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_app/admin/api-keys")({
  component: AdminApiKeysPage,
});
