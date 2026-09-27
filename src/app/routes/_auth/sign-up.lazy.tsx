import { SignUpPage } from "@pages/sign-up";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { memo } from "react";

export const Route = createLazyFileRoute("/_auth/sign-up")({
  component: memo(() => {
    const navigate = useNavigate();

    return (
      <SignUpPage
        onSuccess={() => navigate({ to: "/" })}
        onSignIn={() => navigate({ to: "/sign-in" })}
      />
    );
  }),
});
