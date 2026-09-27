import { useLatestRef } from "@shared/lib/hooks";
import * as React from "react";

export interface UseKeyboardNavOptions {
  open: boolean;
  count: number;
  isDisabled: (index: number) => boolean;
  onSelect: (index: number) => void;
  onOpen: () => void;
  onClose: () => void;
  /** Печатаемый символ при закрытом списке открывает его (search-режим);
   *  пробел при этом печатается, а не выбирает. */
  openOnType?: boolean;
  /** Смена значения сбрасывает подсветку (обычно — identity `options`). */
  resetKey?: unknown;
  /** Индекс подсветки после сброса по `resetKey` (по умолчанию -1). */
  resetIndex?: number;
  /** Прокрутка к подсвеченному с клавиатуры пункту; по умолчанию —
   *  `scrollIntoView` n-го `[role="option"]` внутри `listRef`. */
  scrollToIndex?: (index: number) => void;
}

export interface UseKeyboardNavResult {
  focusedIndex: number;
  /** Подсветка от указателя — без прокрутки списка. */
  setFocusedIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  resetFocus: () => void;
}

const OPEN_KEYS = new Set(["ArrowDown", "ArrowUp", "Enter", " "]);

const isPrintableKey = (e: React.KeyboardEvent): boolean =>
  e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

/** Ближайший не-disabled индекс от `from` в направлении `step`; -1 если нет. */
const findEnabled = (
  from: number,
  step: 1 | -1,
  count: number,
  isDisabled: (index: number) => boolean,
): number => {
  for (let i = from; i >= 0 && i < count; i += step) {
    if (!isDisabled(i)) return i;
  }

  return -1;
};

export const useKeyboardNav = ({
  open,
  count,
  isDisabled,
  onSelect,
  onOpen,
  onClose,
  openOnType = false,
  resetKey,
  resetIndex = -1,
  scrollToIndex,
}: UseKeyboardNavOptions): UseKeyboardNavResult => {
  const [focusedIndex, setFocusedIndexState] = React.useState(-1);
  const [prevResetKey, setPrevResetKey] = React.useState(resetKey);
  const listRef = React.useRef<HTMLDivElement>(null);
  const scrollPendingRef = React.useRef(false);

  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setFocusedIndexState(resetIndex);
  }

  const latest = useLatestRef({
    open,
    count,
    isDisabled,
    onSelect,
    onOpen,
    onClose,
    openOnType,
    focusedIndex,
    scrollToIndex,
  });

  const setFocusedIndex = React.useCallback((index: number) => {
    scrollPendingRef.current = false;
    setFocusedIndexState(index);
  }, []);

  const resetFocus = React.useCallback(
    () => setFocusedIndex(-1),
    [setFocusedIndex],
  );

  const focusByKeyboard = React.useCallback((index: number) => {
    if (index < 0) return;
    scrollPendingRef.current = true;
    setFocusedIndexState(index);
  }, []);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const state = latest.current;

      if (!state.open) {
        if (OPEN_KEYS.has(e.key)) {
          e.preventDefault();
          state.onOpen();
          if (e.key === "ArrowDown") {
            focusByKeyboard(findEnabled(0, 1, state.count, state.isDisabled));
          }
          if (e.key === "ArrowUp") {
            focusByKeyboard(
              findEnabled(state.count - 1, -1, state.count, state.isDisabled),
            );
          }
        } else if (state.openOnType && isPrintableKey(e)) {
          state.onOpen();
        }

        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          focusByKeyboard(
            findEnabled(
              state.focusedIndex + 1,
              1,
              state.count,
              state.isDisabled,
            ),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          focusByKeyboard(
            findEnabled(
              state.focusedIndex - 1,
              -1,
              state.count,
              state.isDisabled,
            ),
          );
          break;
        case "Home":
          e.preventDefault();
          focusByKeyboard(findEnabled(0, 1, state.count, state.isDisabled));
          break;
        case "End":
          e.preventDefault();
          focusByKeyboard(
            findEnabled(state.count - 1, -1, state.count, state.isDisabled),
          );
          break;
        case " ":
          if (state.openOnType) return;
          e.preventDefault();
          if (state.focusedIndex >= 0) state.onSelect(state.focusedIndex);
          break;
        case "Enter":
          e.preventDefault();
          if (state.focusedIndex >= 0) state.onSelect(state.focusedIndex);
          break;
        case "Escape":
          e.preventDefault();
          state.onClose();
          break;
        case "Tab":
          state.onClose();
          break;
      }
    },
    [latest, focusByKeyboard],
  );

  React.useEffect(() => {
    if (!scrollPendingRef.current || focusedIndex < 0) return;
    scrollPendingRef.current = false;

    const customScroll = latest.current.scrollToIndex;

    if (customScroll) {
      customScroll(focusedIndex);

      return;
    }

    const item =
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[
        focusedIndex
      ];

    item?.scrollIntoView?.({ block: "nearest" });
  }, [focusedIndex, latest]);

  return { focusedIndex, setFocusedIndex, handleKeyDown, listRef, resetFocus };
};
