import { createInjectDecorator } from "@shared/lib/di";

import { ThemeMode } from "./theme.types";

/**
 * Абстракция над определением предпочитаемой ОС/браузером цветовой схемы.
 * Web: window.matchMedia. React Native: Appearance.
 */
export const IColorSchemeProvider = createInjectDecorator<IColorSchemeProvider>();

export interface IColorSchemeProvider {
  getPreferredScheme(): ThemeMode;
  onSchemeChange(callback: (scheme: ThemeMode) => void): () => void;
}
