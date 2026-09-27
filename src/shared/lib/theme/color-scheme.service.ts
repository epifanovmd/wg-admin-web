import { injectable } from "inversify";

import { IColorSchemeProvider } from "./color-scheme.types";
import { ThemeMode } from "./theme.types";

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

@injectable()
export class ColorSchemeService implements IColorSchemeProvider {
  getPreferredScheme(): ThemeMode {
    return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
  }

  onSchemeChange(callback: (scheme: ThemeMode) => void): () => void {
    const media = window.matchMedia(DARK_SCHEME_QUERY);
    const handler = (e: MediaQueryListEvent) =>
      callback(e.matches ? "dark" : "light");

    media.addEventListener("change", handler);

    return () => media.removeEventListener("change", handler);
  }
}
