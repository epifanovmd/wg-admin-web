import { disposer } from "@shared/lib/di";
import { NotificationProvider } from "@shared/lib/notifications";
import { ThemeProvider } from "@shared/lib/theme";
import { ModalProvider, TooltipProvider } from "@shared/ui";
import { RouterProvider } from "@tanstack/react-router";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

import { IAppDataStore } from "./app-data.types";
import { PendingScreen } from "./PendingScreen";
import { router } from "./router";

export const App = observer(() => {
  const appData = IAppDataStore.useInstance();
  const { initialize } = appData;

  useEffect(() => {
    const dispose = initialize();

    return () => {
      disposer(dispose);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeProvider>
      <TooltipProvider>
        <NotificationProvider>
          <ModalProvider>
            {/* Роутер — после восстановления сессии: его beforeLoad тогда
                синхронны, и редирект на вход не попадает в гонку перехода. */}
            {appData.isRestored ? (
              <RouterProvider router={router} />
            ) : (
              <PendingScreen />
            )}
          </ModalProvider>
        </NotificationProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
});
