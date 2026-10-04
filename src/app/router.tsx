/* eslint-disable check-file/filename-naming-convention -- инстанс-модуль, не компонент */
import { createRouter } from "@tanstack/react-router";

import { ErrorPage } from "../pages/errors";
import { PendingScreen } from "./PendingScreen";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  // Смена страниц — через View Transitions; вид перехода в motion.css.
  defaultViewTransition: true,
  defaultPendingMinMs: 300,
  defaultPendingMs: 100,
  defaultPendingComponent: PendingScreen,
  defaultErrorComponent: ErrorPage,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
