import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useKanbanBoard } from "../hooks";
import type { KanbanCardData, KanbanItems } from "../kanban.types";

interface FakeSource {
  id: string | number;
  data: KanbanCardData;
  initialGroup: string | number;
  initialIndex: number;
  group: string | number;
  index: number;
}

interface FakeEvent {
  operation: { source: FakeSource; target: null };
  canceled: boolean;
}

/** dnd-kit определяет sortable через instanceof — в тестах подменяем маркером. */
vi.mock("@dnd-kit/react/sortable", () => ({
  isSortable: (source: unknown) =>
    !!source && typeof source === "object" && "initialGroup" in source,
}));

/** Упрощённый `move`: как и настоящий, ищет карточку по id и вставляет её в group/index. */
vi.mock("@dnd-kit/helpers", () => ({
  move: <TCard extends KanbanCardData>(
    items: KanbanItems<TCard>,
    event: FakeEvent,
  ) => {
    const { source } = event.operation;
    const from = Object.keys(items).find(key =>
      items[key]?.some(card => card.id === source.id),
    );
    const card = from ? items[from]?.find(c => c.id === source.id) : undefined;

    if (!from || !card) return items;

    const to = String(source.group);
    const next: KanbanItems<TCard> = {
      ...items,
      [from]: items[from]!.filter(c => c.id !== source.id),
    };
    const target = [...(next[to] ?? [])];

    target.splice(source.index, 0, card);
    next[to] = target;

    return next;
  },
}));

const makeEvent = (
  source: Partial<FakeSource> & Pick<FakeSource, "id" | "initialGroup">,
  canceled = false,
): FakeEvent => ({
  operation: {
    source: {
      data: { id: source.id },
      initialIndex: 0,
      group: source.initialGroup,
      index: 0,
      ...source,
    },
    target: null,
  },
  canceled,
});

/** Тесты подменяют dnd-kit, поэтому событие — минимальная заглушка под все три обработчика. */
const asEvent = (event: FakeEvent) =>
  event as unknown as DragStartEvent & DragOverEvent & DragEndEvent;

const INITIAL: KanbanItems<KanbanCardData> = {
  todo: [{ id: 1 }, { id: 2 }],
  done: [{ id: 3 }],
};

const dragCardToDone = (
  result: { current: ReturnType<typeof useKanbanBoard> },
  options: { canceled?: boolean } = {},
) => {
  act(() =>
    result.current.onDragStart(
      asEvent(makeEvent({ id: 1, initialGroup: "todo" })),
    ),
  );
  act(() =>
    result.current.onDragOver(
      asEvent(
        makeEvent({ id: 1, initialGroup: "todo", group: "done", index: 0 }),
      ),
    ),
  );
  act(() =>
    result.current.onDragOver(
      asEvent(
        makeEvent({ id: 1, initialGroup: "todo", group: "done", index: 1 }),
      ),
    ),
  );
  act(() =>
    result.current.onDragEnd(
      asEvent(
        makeEvent(
          { id: 1, initialGroup: "todo", group: "done", index: 1 },
          options.canceled,
        ),
      ),
    ),
  );
};

describe("useKanbanBoard", () => {
  it("нормализует числовые id групп dnd-kit к строковым ключам items", () => {
    const { result } = renderHook(() =>
      useKanbanBoard({ defaultItems: { "1": [{ id: 10 }], "2": [] } }),
    );

    act(() =>
      result.current.onDragStart(
        asEvent(makeEvent({ id: 10, initialGroup: 1 })),
      ),
    );

    expect(result.current.hoverColumnId).toBe("1");
    expect(result.current.activeCard).toEqual({ id: 10 });
  });

  it("эмитит onItemsChange один раз — по завершении перетаскивания", () => {
    const onItemsChange = vi.fn();
    const { result } = renderHook(() =>
      useKanbanBoard({ defaultItems: INITIAL, onItemsChange }),
    );

    dragCardToDone(result);

    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(onItemsChange).toHaveBeenCalledWith({
      todo: [{ id: 2 }],
      done: [{ id: 3 }, { id: 1 }],
    });
    expect(result.current.items).toEqual({
      todo: [{ id: 2 }],
      done: [{ id: 3 }, { id: 1 }],
    });
  });

  it("при отмене возвращает снимок и не эмитит изменения", () => {
    const onItemsChange = vi.fn();
    const onCardDrop = vi.fn();
    const { result } = renderHook(() =>
      useKanbanBoard({ defaultItems: INITIAL, onItemsChange, onCardDrop }),
    );

    dragCardToDone(result, { canceled: true });

    expect(result.current.items).toEqual(INITIAL);
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(onCardDrop).not.toHaveBeenCalled();
    expect(result.current.activeCard).toBeNull();
  });

  it("при запрещённом переходе подсвечивает колонку и откатывается к снимку", () => {
    const onItemsChange = vi.fn();
    const { result } = renderHook(() =>
      useKanbanBoard({
        defaultItems: INITIAL,
        onItemsChange,
        workflow: { todo: [], done: [] },
      }),
    );

    act(() =>
      result.current.onDragStart(
        asEvent(makeEvent({ id: 1, initialGroup: "todo" })),
      ),
    );
    act(() =>
      result.current.onDragOver(
        asEvent(
          makeEvent({ id: 1, initialGroup: "todo", group: "done", index: 1 }),
        ),
      ),
    );

    expect(result.current.invalidDropColumnId).toBe("done");
    expect(result.current.items).toEqual(INITIAL);

    act(() =>
      result.current.onDragEnd(
        asEvent(
          makeEvent({ id: 1, initialGroup: "todo", group: "done", index: 1 }),
        ),
      ),
    );

    expect(result.current.items).toEqual(INITIAL);
    expect(result.current.invalidDropColumnId).toBeNull();
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("сбрасывает состояние перетаскивания, даже если доска отключена посреди drag", () => {
    const { result, rerender } = renderHook(
      ({ disabled }: { disabled: boolean }) =>
        useKanbanBoard({ defaultItems: INITIAL, disabled }),
      { initialProps: { disabled: false } },
    );

    act(() =>
      result.current.onDragStart(
        asEvent(makeEvent({ id: 1, initialGroup: "todo" })),
      ),
    );

    expect(result.current.activeCard).toEqual({ id: 1 });

    rerender({ disabled: true });

    act(() =>
      result.current.onDragEnd(
        asEvent(makeEvent({ id: 1, initialGroup: "todo" }, true)),
      ),
    );

    expect(result.current.activeCard).toBeNull();
    expect(result.current.hoverColumnId).toBeNull();
    expect(result.current.items).toEqual(INITIAL);
  });

  it("вызывает onCardDrop с исходной и конечной позицией", () => {
    const onCardDrop = vi.fn();
    const { result } = renderHook(() =>
      useKanbanBoard({ defaultItems: INITIAL, onCardDrop }),
    );

    dragCardToDone(result);

    expect(onCardDrop).toHaveBeenCalledWith({
      card: { id: 1 },
      fromColumnId: "todo",
      toColumnId: "done",
      fromIndex: 0,
      toIndex: 1,
    });
  });

  describe("WIP-лимит", () => {
    /** Обе колонки заполнены до лимита: todo — 2 из 2, done — 1 из 1. */
    const FULL_COLUMNS = [
      { id: "todo", limit: 2 },
      { id: "done", limit: 1 },
    ];

    it("отклоняет перенос в заполненную колонку из другой колонки", () => {
      const onItemsChange = vi.fn();
      const { result } = renderHook(() =>
        useKanbanBoard({
          defaultItems: INITIAL,
          columns: FULL_COLUMNS,
          onItemsChange,
        }),
      );

      act(() =>
        result.current.onDragStart(
          asEvent(makeEvent({ id: 1, initialGroup: "todo" })),
        ),
      );
      act(() =>
        result.current.onDragOver(
          asEvent(
            makeEvent({ id: 1, initialGroup: "todo", group: "done", index: 1 }),
          ),
        ),
      );

      expect(result.current.invalidDropColumnId).toBe("done");

      act(() =>
        result.current.onDragEnd(
          asEvent(
            makeEvent({ id: 1, initialGroup: "todo", group: "done", index: 1 }),
          ),
        ),
      );

      expect(result.current.items).toEqual(INITIAL);
      expect(onItemsChange).not.toHaveBeenCalled();
    });

    it("разрешает перестановку внутри заполненной колонки", () => {
      const onCardDrop = vi.fn();
      const { result } = renderHook(() =>
        useKanbanBoard({
          defaultItems: INITIAL,
          columns: FULL_COLUMNS,
          onCardDrop,
        }),
      );

      act(() =>
        result.current.onDragStart(
          asEvent(makeEvent({ id: 1, initialGroup: "todo" })),
        ),
      );
      act(() =>
        result.current.onDragOver(
          asEvent(
            makeEvent({ id: 1, initialGroup: "todo", group: "todo", index: 1 }),
          ),
        ),
      );

      expect(result.current.invalidDropColumnId).toBeNull();

      act(() =>
        result.current.onDragEnd(
          asEvent(
            makeEvent({ id: 1, initialGroup: "todo", group: "todo", index: 1 }),
          ),
        ),
      );

      expect(result.current.items.todo).toEqual([{ id: 2 }, { id: 1 }]);
      expect(onCardDrop).toHaveBeenCalledWith({
        card: { id: 1 },
        fromColumnId: "todo",
        toColumnId: "todo",
        fromIndex: 0,
        toIndex: 1,
      });
    });
  });
});
