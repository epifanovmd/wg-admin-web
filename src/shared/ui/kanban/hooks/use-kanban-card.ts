import { SortableKeyboardPlugin } from "@dnd-kit/dom/sortable";
import { useSortable } from "@dnd-kit/react/sortable";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import type { KanbanCardData } from "../kanban.types";

export interface UseKanbanCardOptions<TCard extends KanbanCardData> {
  card: TCard;
  index: number;
  columnId: string;
  disabled?: boolean;
}

export interface UseKanbanCardResult {
  ref: (element: Element | null) => void;
  handleRef: (element: Element | null) => void;
  isDragging: boolean;
  /** `true` сразу после drop: браузер шлёт click по отпущенной карточке, его надо проигнорировать. */
  wasDraggedRef: RefObject<boolean>;
}

/**
 * Только клавиатурный плагин: `OptimisticSortingPlugin` из набора по умолчанию
 * переставляет DOM сам, а порядок здесь уже задаёт превью `useKanbanBoard`
 * через `move()` — вместе они дают двойную перестановку и дёргание карточек.
 */
const PLUGINS = [SortableKeyboardPlugin];

export const useKanbanCard = <TCard extends KanbanCardData>(
  options: UseKanbanCardOptions<TCard>,
): UseKanbanCardResult => {
  const { card, index, columnId, disabled } = options;

  const { ref, handleRef, isDragging } = useSortable({
    id: card.id,
    index,
    group: columnId,
    type: "card",
    accept: "card",
    data: card,
    disabled,
    plugins: PLUGINS,
  });

  const wasDraggedRef = useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDraggedRef.current = true;

      return;
    }

    const timer = setTimeout(() => {
      wasDraggedRef.current = false;
    }, 0);

    return () => clearTimeout(timer);
  }, [isDragging]);

  return { ref, handleRef, isDragging, wasDraggedRef };
};
