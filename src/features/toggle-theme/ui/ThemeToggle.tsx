import { IThemeStore } from "@shared/lib/theme";
import { ThemeToggleButton, type ThemeToggleButtonProps } from "@shared/ui";
import { observer } from "mobx-react-lite";

export type ThemeToggleProps = Omit<
  ThemeToggleButtonProps,
  "isDark" | "onToggle"
>;

/** Кнопка смены темы, подключённая к `IThemeStore`. */
export const ThemeToggle = observer<ThemeToggleProps>(props => {
  const { isDark, toggleTheme } = IThemeStore.useInstance();

  return (
    <ThemeToggleButton isDark={isDark} onToggle={toggleTheme} {...props} />
  );
});
