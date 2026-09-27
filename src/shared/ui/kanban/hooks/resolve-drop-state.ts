import type { KanbanDropState } from "../kanban.types";

export interface ResolveDropStateInput {
  columnId: string;
  hoverColumnId: string | null;
  invalidDropColumnId: string | null;
  columnValidity: Record<string, boolean> | null;
}

/** Сводит состояние доски к одному варианту оформления колонки. */
export const resolveDropState = ({
  columnId,
  hoverColumnId,
  invalidDropColumnId,
  columnValidity,
}: ResolveDropStateInput): KanbanDropState => {
  if (invalidDropColumnId === columnId) return "invalid";
  if (hoverColumnId === columnId) return "over";

  const validity = columnValidity?.[columnId];

  if (validity === true) return "previewValid";
  if (validity === false) return "previewInvalid";

  return "idle";
};
