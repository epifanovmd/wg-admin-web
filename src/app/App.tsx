import { disposer } from "@shared/lib/di";
import { NotificationProvider } from "@shared/lib/notifications";
import { ThemeProvider } from "@shared/lib/theme";
import { ModalProvider, TooltipProvider } from "@shared/ui";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";

import { IAppDataStore } from "./app-data.types";
import { router } from "./router";

export const App = () => {
  const { initialize } = IAppDataStore.useInstance();

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
            <RouterProvider router={router} />
          </ModalProvider>
        </NotificationProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};
