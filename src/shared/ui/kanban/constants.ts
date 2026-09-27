/** Пользовательские строки доски; переопределяются пропом `labels`. */
export const KANBAN_LABELS = {
  board: "Канбан-доска",
  emptyColumn: "Нет карточек",
  draggableCard: "перетаскиваемая карточка",
  /** Счётчик карточек в шапке колонки: с лимитом — «2/5». */
  count: (count: number, limit?: number) =>
    limit == null ? String(count) : `${count}/${limit}`,
};

export type KanbanLabels = typeof KANBAN_LABELS;
