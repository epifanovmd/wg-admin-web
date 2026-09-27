import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";

export interface UseKanbanColumnOptions {
  id: string;
  disabled?: boolean;
}

export interface UseKanbanColumnResult {
  ref: (element: Element | null) => void;
}

/** Подсветка колонки берётся из `useKanbanBoard` (`hoverColumnId`), а не из droppable. */
export const useKanbanColumn = (
  options: UseKanbanColumnOptions,
): UseKanbanColumnResult => {
  const { id, disabled } = options;

  const { ref } = useDroppable({
    id,
    type: "column",
    accept: "card",
    collisionPriority: CollisionPriority.Low,
    disabled,
  });

  return { ref };
};
