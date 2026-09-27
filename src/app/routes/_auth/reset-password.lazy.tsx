import { ResetPasswordPage } from "@pages/reset-password";
import {
  createLazyFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { memo } from "react";

export const Route = createLazyFileRoute("/_auth/reset-password")({
  component: memo(() => {
    const navigate = useNavigate();
    const { token } = useSearch({ from: "/_auth/reset-password" });

    return (
      <ResetPasswordPage
        token={token}
        onSuccess={() => navigate({ to: "/sign-in" })}
      />
    );
  }),
});
