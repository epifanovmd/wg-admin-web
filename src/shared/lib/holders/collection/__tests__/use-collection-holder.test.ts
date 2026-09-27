import { act, renderHook } from "@testing-library/react";

import { useCollection } from "../use-collection-holder";

describe("Collection React integration", () => {
  it("exposes collection methods and reactive getters", async () => {
    const hook = renderHook(() =>
      useCollection({
        queryFn: async () => ({ data: [{ id: 1 }] }),
        keyExtractor: value => value.id,
        watch: ["load"],
      }),
    );

    await act(async () => undefined);

    expect(hook.result.current.count).toBe(1);
    Object.values(hook.result.current);
    hook.result.current.prependItem({ id: 0 });
    hook.result.current.appendItem({ id: 2 });
    hook.result.current.updateItem(2, { id: 3 });
    hook.result.current.upsertItem(4, { id: 4 });
    hook.result.current.removeItem(0);
    await hook.result.current.refresh("refresh");
    await hook.result.current.fromApi(async () => ({ data: [{ id: 5 }] }));
    expect(hook.result.current.isSuccess).toBe(true);
    hook.result.current.reset();
    expect(hook.result.current.isIdle).toBe(true);
    hook.unmount();
  });

  it("без watch сама не грузит; autoLoad — один раз при монтировании; enabled: false — не грузит", async () => {
    const queryFn = vi.fn(async () => ({ data: [{ id: 1 }] }));

    const manual = renderHook(() => useCollection({ queryFn }));

    await act(async () => undefined);
    expect(queryFn).not.toHaveBeenCalled();
    expect(manual.result.current.count).toBe(0);
    manual.unmount();

    const auto = renderHook(() => useCollection({ queryFn, autoLoad: true }));

    await act(async () => undefined);
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(auto.result.current.count).toBe(1);
    auto.unmount();

    queryFn.mockClear();

    const disabled = renderHook(() =>
      useCollection({ queryFn, autoLoad: true, enabled: false }),
    );

    await act(async () => undefined);
    expect(queryFn).not.toHaveBeenCalled();
    disabled.unmount();
  });
});
