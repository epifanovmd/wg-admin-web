import { useControllableState, useEvent } from "@shared/lib/hooks";
import * as React from "react";

import type { SelectOption, SelectRef, SelectValue } from "../types";
import { useKeyboardNav } from "./use-keyboard-nav";

export interface UseSelectEngineOptions<V extends SelectValue> {
  ref: React.ForwardedRef<SelectRef>;
  options: SelectOption<V>[];
  multi?: boolean;
  value: V | V[] | null | undefined;
  onChange?: (value: V | V[] | null) => void;
  onSelect?: (value: V, option: SelectOption<V>) => void;
  onDeselect?: (value: V, option: SelectOption<V>) => void;
  /** Управляемое открытие. */
  open?: boolean;
  /** Вызывается при любой смене open, включая программное закрытие. */
  onOpenChange?: (open: boolean) => void;
  /** Закрывать дропдаун при очистке значения (по умолчанию true). */
  closeOnClear?: boolean;
  /** Триггер содержит текстовый инпут: автофокус при открытии,
   *  печать открывает список. */
  searchable?: boolean;
  /** Сброс поисковой строки: при закрытии дропдауна и после каждого
   *  переключения опции (в multi дропдаун остаётся открытым). */
  onSearchReset?: () => void;
  /** Пункт «Создать» перед опциями: занимает навигационный индекс 0
   *  и получает подсветку при появлении. */
  createItem?: boolean;
  /** Выбор пункта «Создать» (клавиатурой или указателем). */
  onCreateItem?: () => void;
}

export interface UseSelectEngineResult<V extends SelectValue> {
  open: boolean;
  handleOpen: (nextOpen: boolean) => void;
  close: () => void;
  /** Поисковый инпут (search-режим). */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Кнопка-триггер (режим без поиска). */
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  /** Внешняя оболочка поля — `nativeElement` ref-API. */
  triggerRef: React.RefObject<HTMLDivElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  listboxId: string;
  /** id пункта по навигационному индексу (с учётом пункта «Создать»). */
  getOptionId: (index: number) => string;
  /** Сдвиг навигационного индекса опции относительно её индекса в `options`. */
  optionOffset: number;
  /** Сюда список регистрирует свою прокрутку к навигационному индексу
   *  (виртуализация); без регистрации — поиск пункта по id. */
  scrollToIndexRef: React.RefObject<((index: number) => void) | null>;
  /** Выбор по навигационному индексу. */
  selectByIndex: (index: number) => void;
  activeDescendant: string | undefined;
  selectedValues: V[];
  isSelected: (v: V) => boolean;
  hasValue: boolean;
  select: (v: V) => void;
  clear: () => void;
  removeTag: (v: V) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const isEmptyValue = (value: unknown): boolean => value == null || value === "";

/**
 * Headless-ядро выпадающего списка: state открытия, выбор значения,
 * клавиатурная навигация и ref-API. Варианты (Select, Autocomplete, ...)
 * подключают к нему своё представление.
 */
export const useSelectEngine = <V extends SelectValue>({
  ref,
  options,
  multi = false,
  value,
  onChange,
  onSelect,
  onDeselect,
  open: openProp,
  onOpenChange,
  closeOnClear = true,
  searchable = false,
  onSearchReset,
  createItem = false,
  onCreateItem,
}: UseSelectEngineOptions<V>): UseSelectEngineResult<V> => {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const inputRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const listboxId = React.useId();

  const getOptionId = React.useCallback(
    (index: number) => `${listboxId}-option-${index}`,
    [listboxId],
  );

  const selectedValues = React.useMemo<V[]>(() => {
    if (multi) return (value as V[] | undefined) ?? [];

    return isEmptyValue(value) ? [] : [value as V];
  }, [multi, value]);

  const isSelected = React.useCallback(
    (v: V) => selectedValues.includes(v),
    [selectedValues],
  );

  const hasValue = selectedValues.length > 0;

  const resetFocusRef = React.useRef<() => void>(() => {});

  const handleOpen = useEvent((nextOpen: boolean) => {
    if (open === nextOpen) return;
    setOpen(nextOpen);

    if (nextOpen) {
      resetFocusRef.current();
    } else {
      onSearchReset?.();
    }
  });

  const close = React.useCallback(() => handleOpen(false), [handleOpen]);

  React.useEffect(() => {
    if (open && searchable) inputRef.current?.focus();
  }, [open, searchable]);

  const findOption = useEvent((v: V) => options.find(o => o.value === v));

  const select = useEvent((v: V) => {
    const option = findOption(v);
    const wasSelected = selectedValues.includes(v);

    if (multi) {
      const next = wasSelected
        ? selectedValues.filter(x => x !== v)
        : [...selectedValues, v];

      onChange?.(next);
    } else {
      onChange?.(v);
      close();
    }

    if (option) {
      if (multi && wasSelected) onDeselect?.(v, option);
      else onSelect?.(v, option);
    }

    onSearchReset?.();
  });

  const clear = useEvent(() => {
    selectedValues.forEach(v => {
      const option = findOption(v);

      if (option) onDeselect?.(v, option);
    });
    onChange?.(multi ? [] : null);
    if (closeOnClear) close();
  });

  const removeTag = useEvent((v: V) => {
    if (!multi) return;
    const option = findOption(v);

    if (option) onDeselect?.(v, option);
    onChange?.(selectedValues.filter(x => x !== v));
  });

  const optionOffset = createItem ? 1 : 0;
  const scrollToIndexRef = React.useRef<((index: number) => void) | null>(null);

  const isDisabled = useEvent(
    (index: number) =>
      index >= optionOffset && !!options[index - optionOffset]?.disabled,
  );

  const selectByIndex = useEvent((index: number) => {
    if (index < optionOffset) {
      onCreateItem?.();

      return;
    }

    const option = options[index - optionOffset];

    if (option && !option.disabled) select(option.value);
  });

  const scrollToIndex = useEvent((index: number) => {
    if (scrollToIndexRef.current) {
      scrollToIndexRef.current(index);

      return;
    }

    const item = document.getElementById(getOptionId(index));

    item?.scrollIntoView?.({ block: "nearest" });
  });

  const resetKey = React.useMemo(
    () => ({ options, optionOffset }),
    [options, optionOffset],
  );

  const openList = React.useCallback(() => handleOpen(true), [handleOpen]);

  const { focusedIndex, setFocusedIndex, handleKeyDown, listRef, resetFocus } =
    useKeyboardNav({
      open,
      count: options.length + optionOffset,
      isDisabled,
      onSelect: selectByIndex,
      onOpen: openList,
      onClose: close,
      openOnType: searchable,
      resetKey,
      resetIndex: createItem ? 0 : -1,
      scrollToIndex,
    });

  resetFocusRef.current = resetFocus;

  const activeDescendant =
    open && focusedIndex >= 0 ? getOptionId(focusedIndex) : undefined;

  React.useImperativeHandle(
    ref,
    () => ({
      focus() {
        (inputRef.current ?? buttonRef.current)?.focus();
      },
      blur() {
        inputRef.current?.blur();
        buttonRef.current?.blur();
      },
      open(nextOpen = true) {
        handleOpen(nextOpen);
      },
      scrollTo(index: number) {
        scrollToIndex(index + optionOffset);
      },
      get nativeElement() {
        return triggerRef.current;
      },
    }),
    [handleOpen, scrollToIndex, optionOffset],
  );

  return {
    open,
    handleOpen,
    close,
    inputRef,
    buttonRef,
    triggerRef,
    listRef,
    listboxId,
    getOptionId,
    optionOffset,
    scrollToIndexRef,
    selectByIndex,
    activeDescendant,
    selectedValues,
    isSelected,
    hasValue,
    select,
    clear,
    removeTag,
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
};
