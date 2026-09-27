import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: (search: { token?: string }) => ({
    token: search.token ?? "",
  }),
  beforeLoad: ({ search }) => {
    if (!search.token) {
      throw redirect({ to: "/sign-in" });
    }
  },
});
