import { act, renderHook } from "@testing-library/react";

import { useFileList } from "../use-file-list";

const file = (name: string) => new File(["x"], name, { type: "text/plain" });

describe("useFileList", () => {
  it("добавляет, обновляет и удаляет файлы с уникальными id", () => {
    const { result } = renderHook(() => useFileList({ maxFiles: 3 }));

    act(() => {
      result.current.add([file("a.txt"), file("a.txt")]);
    });

    const [first, second] = result.current.items;

    expect(result.current.items).toHaveLength(2);
    expect(first!.id).not.toBe(second!.id);
    expect(result.current.remaining).toBe(1);

    act(() => result.current.update(first!.id, { progress: 0.5 }));
    expect(result.current.items[0]!.progress).toBe(0.5);

    act(() => result.current.remove(first!.id));
    expect(result.current.items.map(item => item.id)).toEqual([second!.id]);

    act(() => result.current.clear());
    expect(result.current.items).toEqual([]);
  });

  it("add возвращает добавленные элементы, remaining без лимита — Infinity", () => {
    const { result } = renderHook(() => useFileList());
    let added: ReturnType<typeof result.current.add> = [];

    act(() => {
      added = result.current.add([file("b.txt")]);
    });

    expect(added[0]!.file.name).toBe("b.txt");
    expect(result.current.remaining).toBe(Infinity);
  });
});
