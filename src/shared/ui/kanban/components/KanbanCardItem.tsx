import { cn } from "@shared/lib/utils";
import type { MouseEvent, ReactNode } from "react";

import { useKanbanCard } from "../hooks";
import type { KanbanCardData, KanbanCardRenderMeta } from "../kanban.types";
import { useKanbanLabels } from "../kanban-context";
import { kanbanCardVariants } from "../kanban-variants";

export interface KanbanCardItemProps<TCard extends KanbanCardData> {
  card: TCard;
  index: number;
  columnId: string;
  disabled?: boolean;
  className?: string;
  renderCard: (card: TCard, meta: KanbanCardRenderMeta) => ReactNode;
  onCardClick?: (card: TCard, event: MouseEvent<HTMLDivElement>) => void;
}

/**
 * Контейнер карточки фокусируемый ради клавиатурного перетаскивания, но не
 * `role="button"`: клик по нему — вспомогательный, действия по клавиатуре
 * рендерятся внутри `renderCard`.
 */
export const KanbanCardItem = <TCard extends KanbanCardData>(
  props: KanbanCardItemProps<TCard>,
) => {
  const {
    card,
    index,
    columnId,
    disabled,
    className,
    renderCard,
    onCardClick,
  } = props;
  const labels = useKanbanLabels();

  const { ref, handleRef, isDragging, wasDraggedRef } = useKanbanCard({
    card,
    index,
    columnId,
    disabled,
  });

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (wasDraggedRef.current) return;

    onCardClick?.(card, event);
  };

  return (
    <div
      ref={ref}
      role="listitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-roledescription={labels.draggableCard}
      onClick={onCardClick ? handleClick : undefined}
      className={cn(
        kanbanCardVariants({ isDragging }),
        disabled && "cursor-default opacity-70 active:cursor-default",
        className,
      )}
    >
      {renderCard(card, { dragHandleRef: handleRef, isDragging })}
    </div>
  );
};
