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
});
