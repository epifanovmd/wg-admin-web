import type {
  KanbanCanDropCard,
  KanbanCardData,
  KanbanItems,
} from "../kanban.types";

export interface ComputeColumnValidityInput<TCard extends KanbanCardData> {
  card: TCard;
  fromColumnId: string;
  columnIds: string[];
  items: KanbanItems<TCard>;
  canDrop: KanbanCanDropCard<TCard>;
}

/** Для каждой колонки — можно ли бросить в неё карточку; исходная колонка всегда допустима. */
export const computeColumnValidity = <TCard extends KanbanCardData>({
  card,
  fromColumnId,
  columnIds,
  items,
  canDrop,
}: ComputeColumnValidityInput<TCard>): Record<string, boolean> => {
  const validity: Record<string, boolean> = {};

  for (const toColumnId of columnIds) {
    validity[toColumnId] =
      toColumnId === fromColumnId ||
      canDrop({ card, fromColumnId, toColumnId, items });
  }

  return validity;
};
