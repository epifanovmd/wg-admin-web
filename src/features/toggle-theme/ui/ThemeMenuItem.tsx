import { IThemeStore } from "@shared/lib/theme";
import { DropdownMenuItem } from "@shared/ui";
import { Moon, Sun } from "lucide-react";
import { observer } from "mobx-react-lite";

/** Пункт выпадающего меню смены темы, подключённый к `IThemeStore`. */
export const ThemeMenuItem = observer(() => {
  const { isDark, toggleTheme } = IThemeStore.useInstance();
  const Icon = isDark ? Sun : Moon;

  return (
    <DropdownMenuItem
      onSelect={event => {
        // Меню остаётся открытым: пользователь видит результат переключения.
        event.preventDefault();
        toggleTheme();
      }}
    >
      <Icon aria-hidden className="text-muted-foreground" />
      {isDark ? "Светлая тема" : "Тёмная тема"}
    </DropdownMenuItem>
  );
});
