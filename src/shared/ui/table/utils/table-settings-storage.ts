import type { TableSettings } from "../hooks/use-table-settings";

export interface TableSettingsStorage {
  /** Снимок из хранилища; `undefined` — нет, повреждён или хранилище недоступно. */
  load: () => TableSettings | undefined;
  save: (settings: TableSettings) => void;
  clear: () => void;
}

const isSettingsObject = (value: unknown): value is TableSettings =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Адаптер localStorage для `useTableSettings`: ошибки (приватный режим,
 * переполнение квоты, битый JSON) глотаются — таблица просто стартует
 * с настройками по умолчанию.
 */
export const createLocalStorageTableSettings = (
  key: string,
): TableSettingsStorage => ({
  load: () => {
    try {
      const raw = localStorage.getItem(key);

      if (raw === null) return undefined;

      const parsed: unknown = JSON.parse(raw);

      return isSettingsObject(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  },
  save: settings => {
    try {
      localStorage.setItem(key, JSON.stringify(settings));
    } catch {
      // Хранилище недоступно — настройки живут только в памяти.
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Хранилище недоступно — удалять нечего.
    }
  },
});
