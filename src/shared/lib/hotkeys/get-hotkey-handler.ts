import type * as React from "react";

import { type HotkeyBinding, runHotkeys } from "./run-hotkeys";

/**
 * Обработчик `onKeyDown` для конкретного элемента (в том числе поля
 * ввода): `onKeyDown={getHotkeyHandler([["mod+enter", send]])}`.
 */
export const getHotkeyHandler =
  <E extends React.KeyboardEvent = React.KeyboardEvent>(
    bindings: HotkeyBinding<E>[],
  ) =>
  (event: E): void =>
    runHotkeys(bindings, event, true);
