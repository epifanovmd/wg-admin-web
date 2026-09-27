import { injectable } from "inversify";
import { makeAutoObservable } from "mobx";

import { IStorageService } from "../storage";
import { IColorSchemeProvider } from "./color-scheme.types";
import { IThemeStore, ThemeMode } from "./theme.types";

const THEME_STORAGE_KEY = "theme";

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark";

@injectable()
export class ThemeStore implements IThemeStore {
  private _theme: ThemeMode;

  constructor(
    @IStorageService() private _storage: IStorageService,
    @IColorSchemeProvider() private _colorScheme: IColorSchemeProvider,
  ) {
    const saved = this._storage.getItem(THEME_STORAGE_KEY);

    this._theme = isThemeMode(saved)
      ? saved
      : this._colorScheme.getPreferredScheme();

    makeAutoObservable(this, {}, { autoBind: true });
  }

  get theme(): ThemeMode {
    return this._theme;
  }

  get isDark(): boolean {
    return this._theme === "dark";
  }

  get isLight(): boolean {
    return this._theme === "light";
  }

  setTheme(theme: ThemeMode): void {
    this._theme = theme;
    this._storage.setItem(THEME_STORAGE_KEY, theme);
  }

  toggleTheme(): void {
    this.setTheme(this._theme === "dark" ? "light" : "dark");
  }
}
