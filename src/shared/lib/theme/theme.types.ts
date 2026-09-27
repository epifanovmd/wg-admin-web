import { createInjectDecorator } from "@shared/lib/di";

export type ThemeMode = "light" | "dark";

export const IThemeStore = createInjectDecorator<IThemeStore>();

export interface IThemeStore {
  readonly theme: ThemeMode;
  readonly isDark: boolean;
  readonly isLight: boolean;

  setTheme(theme: ThemeMode): void;
  toggleTheme(): void;
}
