import type { Hotkey } from "./parse-hotkey";

export type HotkeyModifierState = Pick<
  KeyboardEvent,
  "key" | "code" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey"
>;

const matchesCommandModifiers = (
  hotkey: Hotkey,
  event: HotkeyModifierState,
): boolean =>
  hotkey.mod
    ? event.ctrlKey || event.metaKey
    : event.ctrlKey === hotkey.ctrl && event.metaKey === hotkey.meta;

/**
 * Совпадает ли нажатие с сочетанием. Модификаторы сверяются строго,
 * клавиша — по символу или по физической кнопке (любая раскладка).
 */
export const matchesHotkey = (
  hotkey: Hotkey,
  event: HotkeyModifierState,
): boolean => {
  if (!matchesCommandModifiers(hotkey, event)) return false;
  if (event.altKey !== hotkey.alt || event.shiftKey !== hotkey.shift) {
    return false;
  }

  const key = event.key?.toLowerCase();

  return (
    key === hotkey.key ||
    (hotkey.code !== undefined && event.code === hotkey.code)
  );
};
