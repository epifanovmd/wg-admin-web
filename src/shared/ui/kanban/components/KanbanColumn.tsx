import { cn } from "@shared/lib/utils";
import { type MouseEvent, type ReactNode, useId } from "react";

import { useKanbanColumn } from "../hooks";
import type {
  KanbanCardData,
  KanbanCardRenderMeta,
  KanbanColumnData,
  KanbanDropState,
} from "../kanban.types";
import { kanbanColumnVariants } from "../kanban-variants";
import { KanbanCardItem } from "./KanbanCardItem";
import { KanbanColumnEmpty } from "./KanbanColumnEmpty";
import { KanbanColumnHeader } from "./KanbanColumnHeader";

const CARD_LIST_CLASS = "flex flex-col gap-2";

export interface KanbanColumnProps<
  TCard extends KanbanCardData,
  TColumn extends KanbanColumnData,
> {
  column: TColumn;
  cards: TCard[];
  dropState?: KanbanDropState;
  isCardDraggable?: (card: TCard) => boolean;
  onCardClick?: (card: TCard, event: MouseEvent<HTMLDivElement>) => void;
  renderCard: (card: TCard, meta: KanbanCardRenderMeta) => ReactNode;
  renderHeader?: (column: TColumn, count: number) => ReactNode;
  renderFooter?: (column: TColumn, count: number) => ReactNode;
  renderEmpty?: (column: TColumn) => ReactNode;
  className?: string;
  cardClassName?: string;
  disabled?: boolean;
}

export const KanbanColumn = <
  TCard extends KanbanCardData,
  TColumn extends KanbanColumnData,
>(
  props: KanbanColumnProps<TCard, TColumn>,
) => {
  const {
    column,
    cards,
    dropState = "idle",
    isCardDraggable,
    onCardClick,
    renderCard,
    renderHeader,
    renderFooter,
    renderEmpty,
    className,
    cardClassName,
    disabled,
  } = props;

  const headerId = useId();
  const { ref } = useKanbanColumn({ id: column.id, disabled });
  const count = cards.length;

  const header = renderHeader ? (
    <div id={headerId}>{renderHeader(column, count)}</div>
  ) : (
    <KanbanColumnHeader
      id={headerId}
      title={column.title}
      count={count}
      limit={column.limit}
    />
  );
  const emptyContent = renderEmpty?.(column);

  return (
    <section
      ref={ref}
      aria-labelledby={headerId}
      className={cn(kanbanColumnVariants({ dropState }), className)}
    >
      <div className="pl-1.5">{header}</div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
        {count > 0 && (
          <div role="list" className={CARD_LIST_CLASS}>
            {cards.map((card, index) => (
              <KanbanCardItem
                key={card.id}
                card={card}
                index={index}
                columnId={column.id}
                disabled={disabled || isCardDraggable?.(card) === false}
                className={cardClassName}
                renderCard={renderCard}
                onCardClick={onCardClick}
              />
            ))}
          </div>
        )}

        {count === 0 && <KanbanColumnEmpty>{emptyContent}</KanbanColumnEmpty>}
      </div>

      {renderFooter && (
        <div className="border-t border-border/60 px-3.5 py-2">
          {renderFooter(column, count)}
        </div>
      )}
    </section>
  );
};
