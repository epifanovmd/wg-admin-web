import type { UniqueIdentifier } from "@dnd-kit/abstract";
import type { MouseEvent, ReactNode } from "react";

import type { KanbanLabels } from "./constants";

export interface KanbanCardData {
  id: UniqueIdentifier;
}

/** Идентификаторы колонок — строки: они же ключи `KanbanItems`. */
export interface KanbanColumnData {
  id: string;
  title: ReactNode;
  /** WIP-лимит: при достижении колонка не принимает карточки из других колонок. */
  limit?: number;
}

export type KanbanItems<TCard extends KanbanCardData> = Record<string, TCard[]>;

export interface KanbanCardRenderMeta {
  dragHandleRef: (element: Element | null) => void;
  isDragging: boolean;
}

export interface KanbanCardDropEvent<TCard extends KanbanCardData> {
  card: TCard;
  fromColumnId: string;
  toColumnId: string;
  fromIndex: number;
  toIndex: number;
}

export interface KanbanCanDropContext<TCard extends KanbanCardData> {
  card: TCard;
  fromColumnId: string;
  toColumnId: string;
  items: KanbanItems<TCard>;
}

export type KanbanCanDropCard<TCard extends KanbanCardData> = (
  context: KanbanCanDropContext<TCard>,
) => boolean;

/** Граф переходов: из колонки-ключа карточку можно перенести только в перечисленные. */
export type KanbanWorkflow = Record<string, string[]>;

/** Состояние колонки во время перетаскивания. */
export type KanbanDropState =
  "idle" | "over" | "invalid" | "previewValid" | "previewInvalid";

export interface KanbanProps<
  TCard extends KanbanCardData,
  TColumn extends KanbanColumnData,
> {
  columns: TColumn[];

  items?: KanbanItems<TCard>;
  defaultItems?: KanbanItems<TCard>;
  /** Вызывается один раз по завершении перетаскивания; промежуточные перестановки — внутреннее превью. */
  onItemsChange?: (items: KanbanItems<TCard>) => void;
  onCardDrop?: (event: KanbanCardDropEvent<TCard>) => void;
  canDropCard?: KanbanCanDropCard<TCard>;
  workflow?: KanbanWorkflow;
  isCardDraggable?: (card: TCard) => boolean;
  onCardClick?: (card: TCard, event: MouseEvent<HTMLDivElement>) => void;
  /** Подсвечивать допустимые/недопустимые колонки сразу при старте перетаскивания. */
  highlightOnDragStart?: boolean;

  /**
   * Контейнер карточки — не кнопка: если карточке нужны действия по клику
   * с клавиатуры, интерактивные элементы рендерятся внутри `renderCard`.
   */
  renderCard: (card: TCard, meta: KanbanCardRenderMeta) => ReactNode;
  renderColumnHeader?: (column: TColumn, count: number) => ReactNode;
  renderColumnFooter?: (column: TColumn, count: number) => ReactNode;
  renderColumnEmpty?: (column: TColumn) => ReactNode;

  labels?: Partial<KanbanLabels>;
  "aria-label"?: string;
  className?: string;
  columnClassName?: string;
  cardClassName?: string;
  disabled?: boolean;
}
