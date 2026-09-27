import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { cn } from "@shared/lib/utils";
import { useMemo } from "react";

import { KanbanCardOverlay, KanbanColumn } from "./components";
import { KANBAN_LABELS } from "./constants";
import { resolveDropState, useKanbanBoard } from "./hooks";
import type {
  KanbanCardData,
  KanbanColumnData,
  KanbanProps,
} from "./kanban.types";
import { KanbanLabelsContext } from "./kanban-context";
import { kanbanBoardVariants } from "./kanban-variants";

/** Стабильный пустой список: не сбрасывает мемоизацию колонки без карточек. */
const EMPTY_CARDS: never[] = [];

export const Kanban = <
  TCard extends KanbanCardData,
  TColumn extends KanbanColumnData,
>(
  props: KanbanProps<TCard, TColumn>,
) => {
  const {
    columns,
    items: controlledItems,
    defaultItems,
    onItemsChange,
    onCardDrop,
    canDropCard,
    workflow,
    isCardDraggable,
    onCardClick,
    highlightOnDragStart,
    renderCard,
    renderColumnHeader,
    renderColumnFooter,
    renderColumnEmpty,
    labels: labelsOverride,
    "aria-label": ariaLabel,
    className,
    columnClassName,
    cardClassName,
    disabled,
  } = props;

  const labels = useMemo(
    () => ({ ...KANBAN_LABELS, ...labelsOverride }),
    [labelsOverride],
  );

  const {
    items,
    activeCard,
    hoverColumnId,
    invalidDropColumnId,
    columnValidity,
    onDragStart,
    onDragOver,
    onDragEnd,
  } = useKanbanBoard({
    items: controlledItems,
    defaultItems,
    onItemsChange,
    onCardDrop,
    canDropCard,
    workflow,
    columns,
    highlightOnDragStart,
    disabled,
  });

  return (
    <KanbanLabelsContext.Provider value={labels}>
      <DragDropProvider
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div
          role="region"
          aria-label={ariaLabel ?? labels.board}
          className={cn(kanbanBoardVariants(), className)}
        >
          {columns.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={items[column.id] ?? EMPTY_CARDS}
              dropState={resolveDropState({
                columnId: column.id,
                hoverColumnId,
                invalidDropColumnId,
                columnValidity,
              })}
              isCardDraggable={isCardDraggable}
              onCardClick={onCardClick}
              renderCard={renderCard}
              renderHeader={renderColumnHeader}
              renderFooter={renderColumnFooter}
              renderEmpty={renderColumnEmpty}
              className={columnClassName}
              cardClassName={cardClassName}
              disabled={disabled}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && (
            <KanbanCardOverlay
              card={activeCard}
              invalid={invalidDropColumnId != null}
              className={cardClassName}
              renderCard={renderCard}
            />
          )}
        </DragOverlay>
      </DragDropProvider>
    </KanbanLabelsContext.Provider>
  );
};
