/** Разобранное сочетание: клавиша в нижнем регистре и флаги модификаторов. */
export interface Hotkey {
  key: string;
  /** Физическая клавиша (`KeyK`, `Digit1`, `Comma`) — для любой раскладки. */
  code?: string;
  /** Ctrl или Cmd — что нажато, то и подходит. */
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

type Modifier = "mod" | "ctrl" | "meta" | "alt" | "shift";

const MODIFIER_ALIASES: Record<string, Modifier> = {
  mod: "mod",
  ctrl: "ctrl",
  control: "ctrl",
  meta: "meta",
  cmd: "meta",
  command: "meta",
  win: "meta",
  alt: "alt",
  option: "alt",
  shift: "shift",
};

const KEY_ALIASES: Record<string, string> = {
  esc: "escape",
  return: "enter",
  del: "delete",
  space: " ",
  plus: "+",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
};

const PUNCTUATION_CODES: Record<string, string> = {
  ",": "Comma",
  ".": "Period",
  "/": "Slash",
  ";": "Semicolon",
  "'": "Quote",
  "[": "BracketLeft",
  "]": "BracketRight",
  "\\": "Backslash",
  "-": "Minus",
  "=": "Equal",
  "`": "Backquote",
};

const LETTER_RE = /^[a-z]$/;
const DIGIT_RE = /^\d$/;

const resolveCode = (key: string): string | undefined => {
  if (LETTER_RE.test(key)) return `Key${key.toUpperCase()}`;
  if (DIGIT_RE.test(key)) return `Digit${key}`;

  return PUNCTUATION_CODES[key];
};

/**
 * Разбирает сочетание вида `mod+shift+p`: части через `+`, последняя —
 * клавиша, остальные — модификаторы (`mod`, `ctrl`, `meta`/`cmd`,
 * `alt`/`option`, `shift`). Сам `+` записывается как `plus`.
 */
export const parseHotkey = (combo: string): Hotkey => {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map(part => part.trim());
  const rawKey = parts.pop() ?? "";

  if (!rawKey) throw new Error(`Не указана клавиша в сочетании «${combo}»`);

  const hotkey: Hotkey = {
    key: KEY_ALIASES[rawKey] ?? rawKey,
    mod: false,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
  };

  parts.forEach(part => {
    const modifier = MODIFIER_ALIASES[part];

    if (!modifier) {
      throw new Error(`Неизвестный модификатор «${part}» в «${combo}»`);
    }
    hotkey[modifier] = true;
  });

  hotkey.code = resolveCode(hotkey.key);

  return hotkey;
};
