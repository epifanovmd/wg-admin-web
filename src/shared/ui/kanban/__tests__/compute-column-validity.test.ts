import { describe, expect, it } from "vitest";

import { computeColumnValidity } from "../hooks";

describe("computeColumnValidity", () => {
  it("исходная колонка всегда допустима, остальные — по canDrop", () => {
    const validity = computeColumnValidity({
      card: { id: 1 },
      fromColumnId: "todo",
      columnIds: ["todo", "doing", "done"],
      items: { todo: [{ id: 1 }], doing: [], done: [] },
      canDrop: ({ toColumnId }) => toColumnId === "doing",
    });

    expect(validity).toEqual({ todo: true, doing: true, done: false });
  });
});
