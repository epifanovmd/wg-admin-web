import { Spinner } from "@shared/ui";
import { FC } from "react";

/** Экран ожидания на всю страницу: восстановление сессии и загрузка маршрута. */
export const PendingScreen: FC = () => (
  <div className="flex h-screen w-screen items-center justify-center">
    <Spinner size="lg" />
  </div>
);
