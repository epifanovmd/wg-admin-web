import { isObservable, reaction } from "mobx";

import { CollectionHolder } from "../../collection/collection-holder";
import { CursorHolder } from "../../cursor/cursor-holder";
import { SyncCursorHolder } from "../../cursor/sync-cursor-holder";
import { InfiniteHolder } from "../../infinite/infinite-holder";
import { PagedHolder } from "../../paged/paged-holder";

interface Dto {
  id: string;
  rank: number;
  tags: string[];
  meta: { title: string };
}

const dto = (rank: number): Dto => ({
  id: String(rank),
  rank,
  tags: ["a"],
  meta: { title: `t-${rank}` },
});

const keyExtractor = (value: Dto) => value.id;

/** Число срабатываний реакции на смену массива `items`. */
const trackItems = (source: () => readonly Dto[]) => {
  let calls = 0;
  const dispose = reaction(source, () => {
    calls++;
  });

  return {
    get calls() {
      return calls;
    },
    dispose,
  };
};

const expectPlain = (items: readonly Dto[]) => {
  expect(isObservable(items[0])).toBe(false);
  expect(isObservable(items[0].tags)).toBe(false);
  expect(isObservable(items[0].meta)).toBe(false);
};

describe("list holders keep DTOs plain", () => {
  it("CollectionHolder stores items by reference and still notifies", () => {
    const holder = new CollectionHolder<Dto>({ keyExtractor });
    const tracker = trackItems(() => holder.items);
    const items = [dto(1), dto(2)];

    holder.setItems(items);
    expect(holder.items).toBe(items);
    expectPlain(holder.items);

    holder.updateItem("1", dto(10));
    holder.upsertItem("3", dto(3));
    holder.appendItem(dto(4));
    holder.prependItem(dto(0));
    holder.updateItems(value => (value.id === "2" ? dto(20) : value));
    holder.removeItem("0");

    expectPlain(holder.items);
    expect(tracker.calls).toBe(7);
    tracker.dispose();
  });

  it("PagedHolder and InfiniteHolder keep items plain", () => {
    const paged = new PagedHolder<Dto>({ keyExtractor });
    const infinite = new InfiniteHolder<Dto>({ keyExtractor });
    const tracker = trackItems(() => infinite.items);

    paged.setItems([dto(1)], 1);
    infinite.setItems([dto(1)], true);
    infinite.appendItems([dto(2)], false);

    expectPlain(paged.items);
    expectPlain(infinite.items);
    expect(tracker.calls).toBe(2);
    tracker.dispose();
  });

  it("CursorHolder keeps pages plain", () => {
    const holder = new CursorHolder<Dto>({ keyExtractor });
    const tracker = trackItems(() => holder.items);

    holder.setItems([dto(2)], true, true);
    holder.appendItems([dto(1)], false);
    holder.prependItems([dto(3)], false);

    expectPlain(holder.items);
    expect(tracker.calls).toBe(3);
    tracker.dispose();
  });

  it("SyncCursorHolder buffers pending items by replacing the array", () => {
    const holder = new SyncCursorHolder<Dto>(
      { fetch: async () => null },
      {
        keyExtractor,
        idExtractor: keyExtractor,
        sort: (left, right) => left.rank - right.rank,
      },
    );
    const tracker = trackItems(() => holder.pendingItems);
    const before = holder.pendingItems;

    holder.bufferPendingItem(dto(1));
    holder.bufferPendingItem(dto(2));

    expect(holder.pendingItems).not.toBe(before);
    expect(holder.pendingItems.map(value => value.id)).toEqual(["1", "2"]);
    expectPlain(holder.pendingItems);
    expect(tracker.calls).toBe(2);
    tracker.dispose();
  });
});
