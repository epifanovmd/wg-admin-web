import { SignInPage } from "@pages/sign-in";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { memo } from "react";

export const Route = createLazyFileRoute("/_auth/sign-in")({
  component: memo(() => {
    const navigate = useNavigate();

    return (
      <SignInPage
        onSuccess={() => navigate({ to: "/" })}
        onForgotPassword={() => navigate({ to: "/forgot-password" })}
        onSignUp={() => navigate({ to: "/sign-up" })}
      />
    );
  }),
});
