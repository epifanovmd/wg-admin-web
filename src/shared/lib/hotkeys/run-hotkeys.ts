import type * as React from "react";

import { isEditableTarget } from "./is-editable-target";
import { matchesHotkey } from "./match-hotkey";
import { parseHotkey } from "./parse-hotkey";

export type HotkeyEvent = KeyboardEvent | React.KeyboardEvent;

export interface HotkeyOptions {
  /** Отменять действие браузера по умолчанию (по умолчанию `true`). */
  preventDefault?: boolean;
  /** Срабатывать при фокусе в поле ввода. */
  allowInInputs?: boolean;
}

/** Сочетание (или альтернативы), обработчик и опции. */
export type HotkeyBinding<E extends HotkeyEvent = KeyboardEvent> = [
  combo: string | string[],
  handler: (event: E) => void,
  options?: HotkeyOptions,
];

const isComposing = (event: HotkeyEvent): boolean =>
  "nativeEvent" in event ? event.nativeEvent.isComposing : event.isComposing;

const toCombos = (combo: string | string[]): string[] =>
  Array.isArray(combo) ? combo : [combo];

/**
 * Запускает первый подходящий обработчик. `allowInInputs` — значение по
 * умолчанию для привязок без явной опции.
 */
export const runHotkeys = <E extends HotkeyEvent>(
  bindings: HotkeyBinding<E>[],
  event: E,
  allowInInputs = false,
): void => {
  if (isComposing(event)) return;

  const editable = isEditableTarget(event.target);
  const binding = bindings.find(([combo, , options]) => {
    if (editable && !(options?.allowInInputs ?? allowInInputs)) return false;

    return toCombos(combo).some(item =>
      matchesHotkey(parseHotkey(item), event),
    );
  });

  if (!binding) return;

  const [, handler, options] = binding;

  if (options?.preventDefault ?? true) event.preventDefault();
  handler(event);
};
