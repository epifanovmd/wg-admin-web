import { describe, expect, it } from "vitest";

import { formatHotkey } from "../format-hotkey";
import { isEditableTarget } from "../is-editable-target";
import { matchesHotkey } from "../match-hotkey";
import { parseHotkey } from "../parse-hotkey";

const keyEvent = (init: KeyboardEventInit) =>
  new KeyboardEvent("keydown", init);

describe("parseHotkey", () => {
  it("разбирает модификаторы с алиасами и клавишу", () => {
    expect(parseHotkey("Mod+Shift+P")).toEqual({
      key: "p",
      code: "KeyP",
      mod: true,
      ctrl: false,
      meta: false,
      alt: false,
      shift: true,
    });
    expect(parseHotkey("cmd+option+control+1")).toMatchObject({
      key: "1",
      code: "Digit1",
      meta: true,
      alt: true,
      ctrl: true,
    });
  });

  it("нормализует алиасы клавиш и пунктуацию", () => {
    expect(parseHotkey("esc").key).toBe("escape");
    expect(parseHotkey("space").key).toBe(" ");
    expect(parseHotkey("mod+plus").key).toBe("+");
    expect(parseHotkey("mod+,")).toMatchObject({ key: ",", code: "Comma" });
    expect(parseHotkey("F2")).toMatchObject({ key: "f2", code: undefined });
  });

  it("бросает ошибку на неизвестный модификатор или пустую клавишу", () => {
    expect(() => parseHotkey("hyper+k")).toThrow(/hyper/);
    expect(() => parseHotkey("mod+")).toThrow();
  });
});

describe("matchesHotkey", () => {
  it("mod срабатывает и на Ctrl, и на Cmd", () => {
    const hotkey = parseHotkey("mod+k");

    expect(matchesHotkey(hotkey, keyEvent({ key: "k", ctrlKey: true }))).toBe(
      true,
    );
    expect(matchesHotkey(hotkey, keyEvent({ key: "k", metaKey: true }))).toBe(
      true,
    );
    expect(matchesHotkey(hotkey, keyEvent({ key: "k" }))).toBe(false);
  });

  it("модификаторы сверяются строго", () => {
    const hotkey = parseHotkey("ctrl+b");

    expect(matchesHotkey(hotkey, keyEvent({ key: "b", ctrlKey: true }))).toBe(
      true,
    );
    expect(
      matchesHotkey(
        hotkey,
        keyEvent({ key: "b", ctrlKey: true, shiftKey: true }),
      ),
    ).toBe(false);
    expect(matchesHotkey(hotkey, keyEvent({ key: "b", metaKey: true }))).toBe(
      false,
    );
  });

  it("работает в любой раскладке по физической клавише", () => {
    expect(
      matchesHotkey(
        parseHotkey("mod+k"),
        keyEvent({ key: "л", code: "KeyK", ctrlKey: true }),
      ),
    ).toBe(true);
    expect(
      matchesHotkey(
        parseHotkey("shift+/"),
        keyEvent({ key: "?", code: "Slash", shiftKey: true }),
      ),
    ).toBe(true);
  });

  it("клавиши без модификаторов и регистр", () => {
    expect(
      matchesHotkey(parseHotkey("backspace"), keyEvent({ key: "Backspace" })),
    ).toBe(true);
    expect(
      matchesHotkey(
        parseHotkey("shift+p"),
        keyEvent({ key: "P", shiftKey: true }),
      ),
    ).toBe(true);
    expect(
      matchesHotkey(parseHotkey("f2"), keyEvent({ key: "F3", code: "F3" })),
    ).toBe(false);
  });
});

describe("formatHotkey", () => {
  it("на Apple — символы в порядке ⌃⌥⇧⌘ без разделителя", () => {
    expect(formatHotkey("mod+shift+p", { apple: true })).toBe("⇧⌘P");
    expect(formatHotkey("ctrl+alt+backspace", { apple: true })).toBe("⌃⌥⌫");
    expect(formatHotkey("mod+,", { apple: true })).toBe("⌘,");
  });

  it("на остальных — названия через «+»", () => {
    expect(formatHotkey("mod+shift+p", { apple: false })).toBe("Ctrl+Shift+P");
    expect(formatHotkey("meta+alt+arrowup", { apple: false })).toBe(
      "Alt+Win+↑",
    );
    expect(formatHotkey("delete", { apple: false })).toBe("Del");
    expect(formatHotkey("f2", { apple: false })).toBe("F2");
    expect(formatHotkey("escape", { apple: false })).toBe("Esc");
  });
});

describe("isEditableTarget", () => {
  it("текстовые поля и contenteditable — редактируемые", () => {
    const text = document.createElement("input");
    const checkbox = document.createElement("input");
    const editable = document.createElement("div");

    checkbox.type = "checkbox";
    editable.setAttribute("contenteditable", "true");

    expect(isEditableTarget(text)).toBe(true);
    expect(isEditableTarget(document.createElement("textarea"))).toBe(true);
    expect(isEditableTarget(document.createElement("select"))).toBe(true);
    expect(isEditableTarget(editable)).toBe(true);
    expect(isEditableTarget(checkbox)).toBe(false);
    expect(isEditableTarget(document.createElement("button"))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});
