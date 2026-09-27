import { useHotkeys } from "@shared/lib/hotkeys";

export interface UseCommandShortcutOptions {
  /** Клавиша в паре с Ctrl/Cmd. По умолчанию `k`. */
  key?: string;
  enabled?: boolean;
}

/**
 * Глобальное сочетание Ctrl/Cmd + `key` (по умолчанию K) — в любой
 * раскладке и в том числе из полей ввода. Обработчик снимается при
 * размонтировании. Частный случай `useHotkeys`.
 */
export const useCommandShortcut = (
  onTrigger: (event: KeyboardEvent) => void,
  { key = "k", enabled = true }: UseCommandShortcutOptions = {},
): void =>
  useHotkeys([[`mod+${key}`, onTrigger, { allowInInputs: true }]], {
    enabled,
  });
