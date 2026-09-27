import { useLatestRef } from "@shared/lib/hooks";
import { type RefObject, useEffect } from "react";

import { type HotkeyBinding, runHotkeys } from "./run-hotkeys";

export type { HotkeyBinding, HotkeyOptions } from "./run-hotkeys";

export interface UseHotkeysOptions {
  enabled?: boolean;
  /** Слушать нажатия только внутри элемента; по умолчанию — весь документ. */
  target?: RefObject<HTMLElement | null>;
}

/**
 * Горячие клавиши: `useHotkeys([["mod+k", open], [["backspace", "delete"], remove]])`.
 * Привязки можно передавать inline — обработчики читаются в момент нажатия.
 * В полях ввода сочетания игнорируются, пока у привязки нет `allowInInputs`.
 */
export const useHotkeys = (
  bindings: HotkeyBinding[],
  { enabled = true, target }: UseHotkeysOptions = {},
): void => {
  const bindingsRef = useLatestRef(bindings);

  useEffect(() => {
    if (!enabled) return undefined;

    const element = target ? target.current : document;

    if (!element) return undefined;

    const handleKeyDown = (event: Event) =>
      runHotkeys(bindingsRef.current, event as KeyboardEvent);

    element.addEventListener("keydown", handleKeyDown);

    return () => element.removeEventListener("keydown", handleKeyDown);
  }, [enabled, target, bindingsRef]);
};
