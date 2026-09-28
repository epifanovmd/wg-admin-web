import { act, renderHook } from "@testing-library/react";

import { useInfinite } from "../use-infinite-holder";

describe("Infinite React integration", () => {
  it("exposes infinite loading state and methods", async () => {
    const hook = renderHook(() =>
      useInfinite({
        queryFn: async ({ offset }) => ({ data: { data: [{ id: offset }] } }),
        pageSize: 1,
        watch: ["load"],
      }),
    );

    await act(async () => undefined);

    expect(hook.result.current.hasMore).toBe(true);
    Object.values(hook.result.current);
    await hook.result.current.loadMore();
    await hook.result.current.refresh("refresh");
    expect(hook.result.current.isLoadMoreError).toBe(false);
    expect(hook.result.current.loadMoreError).toBeNull();
    hook.result.current.reset();
    hook.unmount();
  });

  it("calls the queryFn of the latest render", async () => {
    const hook = renderHook(
      ({ value }: { value: string }) =>
        useInfinite<string>({
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
