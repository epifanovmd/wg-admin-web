import { IAuthStore } from "@entities/auth";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AuthLayout } from "@widgets/auth-layout";
import { memo } from "react";

export const Route = createFileRoute("/_auth")({
  beforeLoad: () => {
    const auth = IAuthStore.getInstance();

    if (auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: memo(() => (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )),
});
