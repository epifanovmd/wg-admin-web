import { type Hotkey, parseHotkey } from "./parse-hotkey";

export interface FormatHotkeyOptions {
  /** Формат Apple (символы ⌘⌥⇧⌃); по умолчанию — по платформе. */
  apple?: boolean;
}

interface NavigatorWithUAData extends Navigator {
  userAgentData?: { platform?: string };
}

const APPLE_PLATFORM_RE = /mac|iphone|ipad|ipod/i;

/** Платформа Apple: на ней `mod` — это Cmd. */
export const isApplePlatform = (): boolean => {
  if (typeof navigator === "undefined") return false;

  const nav = navigator as NavigatorWithUAData;

  return APPLE_PLATFORM_RE.test(nav.userAgentData?.platform ?? nav.platform);
};

const SPECIAL_KEYS: Record<string, { apple: string; other: string }> = {
  escape: { apple: "Esc", other: "Esc" },
  enter: { apple: "↵", other: "Enter" },
  backspace: { apple: "⌫", other: "Backspace" },
  delete: { apple: "⌦", other: "Del" },
  tab: { apple: "⇥", other: "Tab" },
  " ": { apple: "Space", other: "Space" },
  arrowup: { apple: "↑", other: "↑" },
  arrowdown: { apple: "↓", other: "↓" },
  arrowleft: { apple: "←", other: "←" },
  arrowright: { apple: "→", other: "→" },
};

const formatKey = (key: string, apple: boolean): string => {
  const special = SPECIAL_KEYS[key];

  if (special) return apple ? special.apple : special.other;

  return key.toUpperCase();
};

const appleModifiers = (hotkey: Hotkey): string =>
  [
    hotkey.ctrl && "⌃",
    hotkey.alt && "⌥",
    hotkey.shift && "⇧",
    (hotkey.meta || hotkey.mod) && "⌘",
  ]
    .filter(Boolean)
    .join("");

const otherModifiers = (hotkey: Hotkey): string[] =>
  [
    (hotkey.ctrl || hotkey.mod) && "Ctrl",
    hotkey.alt && "Alt",
    hotkey.shift && "Shift",
    hotkey.meta && "Win",
  ].filter((part): part is string => Boolean(part));

/**
 * Подпись сочетания для интерфейса: `⇧⌘P` на Apple, `Ctrl+Shift+P` на
 * остальных. `mod` показывается как Cmd или Ctrl соответственно.
 */
export const formatHotkey = (
  combo: string,
  { apple = isApplePlatform() }: FormatHotkeyOptions = {},
): string => {
  const hotkey = parseHotkey(combo);
  const key = formatKey(hotkey.key, apple);

  if (apple) return `${appleModifiers(hotkey)}${key}`;

  return [...otherModifiers(hotkey), key].join("+");
};
