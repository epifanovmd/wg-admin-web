import { act, renderHook } from "@testing-library/react";

import { usePaged } from "../use-paged-holder";

describe("Paged React integration", () => {
  it("exposes paged navigation and state", async () => {
    const hook = renderHook(() =>
      usePaged({
        queryFn: async ({ offset }) => ({
          data: { data: [{ id: offset }], totalCount: 3 },
        }),
        keyExtractor: value => value.id,
        pageSize: 1,
        watch: ["load"],
      }),
    );

    await act(async () => undefined);

    expect(hook.result.current.pageCount).toBe(3);
    Object.values(hook.result.current);
    await hook.result.current.nextPage();
    await hook.result.current.prevPage();
    await hook.result.current.goToPage(2);
    await hook.result.current.reload({ refresh: true });
    hook.result.current.setPage(1);
    hook.result.current.setPageSize(2);
    hook.result.current.prependItem({ id: 8 });
    hook.result.current.appendItem({ id: 9 });
    hook.result.current.updateItem(8, { id: 7 });
    hook.result.current.removeItem(7);
    expect(hook.result.current.hasPrevPage).toBe(false);
    hook.result.current.reset();
    hook.unmount();
  });

  it("calls the queryFn of the latest render", async () => {
    const hook = renderHook(
      ({ value }: { value: string }) =>
        usePaged<string>({
          queryFn: async () => ({ data: { data: [value], totalCount: 1 } }),
        }),
      { initialProps: { value: "first" } },
    );

    hook.rerender({ value: "second" });
    await act(async () => {
      await hook.result.current.load();
    });
    expect(hook.result.current.items).toEqual(["second"]);
    hook.unmount();
  });
});
