import { move } from "@dnd-kit/helpers";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { useControllableState, useLatestRef } from "@shared/lib/hooks";
import { useCallback, useMemo, useState } from "react";

import type {
  KanbanCanDropCard,
  KanbanCanDropContext,
  KanbanCardData,
  KanbanCardDropEvent,
  KanbanColumnData,
  KanbanItems,
  KanbanWorkflow,
} from "../kanban.types";
import { computeColumnValidity } from "./compute-column-validity";

export interface UseKanbanBoardOptions<TCard extends KanbanCardData> {
  items?: KanbanItems<TCard>;
  defaultItems?: KanbanItems<TCard>;
  onItemsChange?: (items: KanbanItems<TCard>) => void;
  onCardDrop?: (event: KanbanCardDropEvent<TCard>) => void;
  canDropCard?: KanbanCanDropCard<TCard>;
  workflow?: KanbanWorkflow;
  /** Колонки доски — для подсветки при старте и WIP-лимитов. */
  columns?: Pick<KanbanColumnData, "id" | "limit">[];
  highlightOnDragStart?: boolean;
  disabled?: boolean;
}

export interface UseKanbanBoardResult<TCard extends KanbanCardData> {
  /** Во время перетаскивания — превью с перемещённой карточкой, иначе — актуальные данные. */
  items: KanbanItems<TCard>;
  activeCard: TCard | null;
  hoverColumnId: string | null;
  invalidDropColumnId: string | null;
  columnValidity: Record<string, boolean> | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

/** Всё, что живёт только между dragstart и dragend. */
interface DragSession<TCard extends KanbanCardData> {
  card: TCard;
  fromColumnId: string;
  fromIndex: number;
  /** Данные на момент старта — к ним откатываемся при отмене или запрете. */
  snapshot: KanbanItems<TCard>;
  preview: KanbanItems<TCard>;
  hoverColumnId: string | null;
  invalidDropColumnId: string | null;
  columnValidity: Record<string, boolean> | null;
}

const EMPTY_ITEMS = {};

const findCardColumnId = <TCard extends KanbanCardData>(
  items: KanbanItems<TCard>,
  cardId: TCard["id"],
): string | null => {
  for (const columnId of Object.keys(items)) {
    if (items[columnId]?.some(card => card.id === cardId)) return columnId;
  }

  return null;
};

const findCardIndex = <TCard extends KanbanCardData>(
  cards: TCard[] | undefined,
  cardId: TCard["id"],
): number => cards?.findIndex(card => card.id === cardId) ?? -1;

export const useKanbanBoard = <TCard extends KanbanCardData>(
  options: UseKanbanBoardOptions<TCard>,
): UseKanbanBoardResult<TCard> => {
  const {
    items: controlledItems,
    defaultItems,
    onItemsChange,
    onCardDrop,
    canDropCard,
    workflow,
    columns,
    highlightOnDragStart,
    disabled,
  } = options;

  const [items, setItems] = useControllableState<KanbanItems<TCard>>({
    value: controlledItems,
    defaultValue: defaultItems ?? EMPTY_ITEMS,
    onChange: onItemsChange,
  });
  const [session, setSession] = useState<DragSession<TCard> | null>(null);

  const limits = useMemo(() => {
    const map: Record<string, number> = {};

    for (const column of columns ?? []) {
      if (column.limit != null) map[column.id] = column.limit;
    }

    return map;
  }, [columns]);

  const hasDropValidation =
    !!workflow || !!canDropCard || Object.keys(limits).length > 0;

  const checkCanDrop = useCallback(
    (context: KanbanCanDropContext<TCard>): boolean => {
      const { fromColumnId, toColumnId, items: current } = context;

      if (workflow && !(workflow[fromColumnId] ?? []).includes(toColumnId)) {
        return false;
      }

      const limit = limits[toColumnId];

      if (limit != null && (current[toColumnId]?.length ?? 0) >= limit) {
        return false;
      }

      return canDropCard ? canDropCard(context) : true;
    },
    [workflow, limits, canDropCard],
  );

  // Обработчики dnd-kit стабильны, свежие данные читаем через latest-ref.
  const itemsRef = useLatestRef(items);
  const sessionRef = useLatestRef(session);
  const disabledRef = useLatestRef(disabled);
  const checkCanDropRef = useLatestRef(checkCanDrop);
  const onCardDropRef = useLatestRef(onCardDrop);
  const columnIdsRef = useLatestRef(columns?.map(column => column.id));
  const highlightRef = useLatestRef(
    !!highlightOnDragStart && hasDropValidation,
  );

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const { source } = event.operation;

      if (disabledRef.current || !isSortable(source)) return;

      const card = source.data as TCard;
      // dnd-kit хранит группу как UniqueIdentifier; ключи items — всегда строки.
      const fromColumnId = String(source.initialGroup);
      const snapshot = itemsRef.current;
      const columnIds = columnIdsRef.current;

      setSession({
        card,
        fromColumnId,
        fromIndex: source.initialIndex,
        snapshot,
        preview: snapshot,
        hoverColumnId: fromColumnId,
        invalidDropColumnId: null,
        columnValidity:
          highlightRef.current && columnIds
            ? computeColumnValidity({
                card,
                fromColumnId,
                columnIds,
                items: snapshot,
                canDrop: checkCanDropRef.current,
              })
            : null,
      });
    },
    [disabledRef, itemsRef, columnIdsRef, highlightRef, checkCanDropRef],
  );

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { source } = event.operation;
      const current = sessionRef.current;

      if (disabledRef.current || !isSortable(source) || !current) return;

      const preview = move(current.preview, event);
      const toColumnId = findCardColumnId(preview, source.id as TCard["id"]);
      const rejected =
        toColumnId != null &&
        toColumnId !== current.fromColumnId &&
        !checkCanDropRef.current({
          card: current.card,
          fromColumnId: current.fromColumnId,
          toColumnId,
          items: current.snapshot,
        });

      setSession({
        ...current,
        hoverColumnId: toColumnId,
        invalidDropColumnId: rejected ? toColumnId : null,
        preview: rejected ? current.preview : preview,
      });
    },
    [disabledRef, sessionRef, checkCanDropRef],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const current = sessionRef.current;

      // Сессия сбрасывается всегда — иначе доска, отключённая посреди drag, зависает в состоянии перетаскивания.
      setSession(null);

      if (!current || disabledRef.current) return;

      const { source } = event.operation;

      if (!isSortable(source)) return;

      if (event.canceled || current.invalidDropColumnId != null) return;

      const cardId = source.id as TCard["id"];
      const toColumnId =
        findCardColumnId(current.preview, cardId) ?? current.fromColumnId;
      const foundIndex = findCardIndex(current.preview[toColumnId], cardId);
      const toIndex = foundIndex === -1 ? current.fromIndex : foundIndex;
      const hasMoved =
        toColumnId !== current.fromColumnId || toIndex !== current.fromIndex;

      if (!hasMoved) return;

      setItems(current.preview);
      onCardDropRef.current?.({
        card: current.card,
        fromColumnId: current.fromColumnId,
        toColumnId,
        fromIndex: current.fromIndex,
        toIndex,
      });
    },
    [sessionRef, disabledRef, setItems, onCardDropRef],
  );

  return {
    items: session?.preview ?? items,
    activeCard: session?.card ?? null,
    hoverColumnId: session?.hoverColumnId ?? null,
    invalidDropColumnId: session?.invalidDropColumnId ?? null,
    columnValidity: session?.columnValidity ?? null,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
};
