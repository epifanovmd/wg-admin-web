import { IAuthStore } from "@entities/auth";
import { ErrorPage, NotFoundPage } from "@pages/errors";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { memo } from "react";

export const Route = createRootRoute({
  // Сессию восстанавливает App до запуска роутера; здесь — только запасной
  // путь. Без ожидания beforeLoad синхронный: асинхронный давал роутеру
  // показать экран ожидания, и редирект с `_app` попадал в гонку перехода.
  beforeLoad: () => {
    const auth = IAuthStore.getInstance();

    return auth.isIdle ? auth.restore() : undefined;
  },
  component: memo(() => <Outlet />),
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});
