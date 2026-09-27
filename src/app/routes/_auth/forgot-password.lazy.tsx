import { ForgotPasswordPage } from "@pages/forgot-password";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { memo } from "react";

export const Route = createLazyFileRoute("/_auth/forgot-password")({
  component: memo(() => {
    const navigate = useNavigate();

    return <ForgotPasswordPage onBack={() => navigate({ to: "/sign-in" })} />;
  }),
});
