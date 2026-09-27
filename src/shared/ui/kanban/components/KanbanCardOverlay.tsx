import { cn } from "@shared/lib/utils";
import type { ReactNode } from "react";

import type { KanbanCardData, KanbanCardRenderMeta } from "../kanban.types";
import { kanbanCardVariants } from "../kanban-variants";

export interface KanbanCardOverlayProps<TCard extends KanbanCardData> {
  card: TCard;
  invalid: boolean;
  className?: string;
  renderCard: (card: TCard, meta: KanbanCardRenderMeta) => ReactNode;
}

const NOOP_REF = () => {};

/** У копии под курсором нет своего sortable, поэтому ручка — заглушка. */
const OVERLAY_META: KanbanCardRenderMeta = {
  dragHandleRef: NOOP_REF,
  isDragging: true,
};

/** Карточка, следующая за курсором во время перетаскивания. */
export const KanbanCardOverlay = <TCard extends KanbanCardData>({
  card,
  invalid,
  className,
  renderCard,
}: KanbanCardOverlayProps<TCard>) => (
  <div
    className={cn(
      kanbanCardVariants(),
      "cursor-grabbing shadow-xl",
      invalid && "ring-2 ring-destructive/70",
      className,
    )}
  >
    {renderCard(card, OVERLAY_META)}
  </div>
);
