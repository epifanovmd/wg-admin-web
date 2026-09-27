import * as React from "react";

import type { FileDropListItemData } from "./file-drop.types";

export interface UseFileListOptions {
  /** Лимит файлов в списке; определяет `remaining`. */
  maxFiles?: number;
  initialItems?: FileDropListItemData[];
}

export type FileDropListItemPatch = Partial<
  Pick<FileDropListItemData, "progress" | "error">
>;

export interface UseFileListResult {
  items: FileDropListItemData[];
  /** Добавляет файлы и возвращает созданные элементы (для старта загрузки). */
  add: (files: File[]) => FileDropListItemData[];
  remove: (id: string) => void;
  update: (id: string, patch: FileDropListItemPatch) => void;
  clear: () => void;
  /** Сколько файлов ещё можно добавить — передаётся в `maxFiles` у FileDrop. */
  remaining: number;
}

const NO_ITEMS: FileDropListItemData[] = [];

/** Headless-список файлов для FileDrop + FileDropList: id, прогресс, ошибки. */
export const useFileList = (
  options: UseFileListOptions = {},
): UseFileListResult => {
  const { maxFiles, initialItems = NO_ITEMS } = options;
  const [items, setItems] =
    React.useState<FileDropListItemData[]>(initialItems);
  const counter = React.useRef(0);

  const add = React.useCallback((files: File[]) => {
    const created = files.map(file => {
      counter.current += 1;

      return { id: `${counter.current}-${file.name}`, file };
    });

    setItems(prev => [...prev, ...created]);

    return created;
  }, []);

  const remove = React.useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const update = React.useCallback(
    (id: string, patch: FileDropListItemPatch) => {
      setItems(prev =>
        prev.map(item => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const clear = React.useCallback(() => setItems(NO_ITEMS), []);

  const remaining =
    maxFiles === undefined ? Infinity : Math.max(0, maxFiles - items.length);

  return { items, add, remove, update, clear, remaining };
};
