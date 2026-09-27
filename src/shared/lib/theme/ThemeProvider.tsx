import { observer } from "mobx-react-lite";
import { FC, PropsWithChildren, useEffect } from "react";

import { IThemeStore } from "./theme.types";

/**
 * Веб-адаптер: применяет тему как DOM side-effect (Tailwind dark-класс).
 * Состояние темы живёт в ThemeStore (DI), этот компонент его не хранит.
 */
export const ThemeProvider: FC<PropsWithChildren> = observer(
  ({ children }) => {
    const themeStore = IThemeStore.useInstance();

    useEffect(() => {
      document.documentElement.classList.toggle("dark", themeStore.isDark);
    }, [themeStore.isDark]);

    return children;
  },
);
