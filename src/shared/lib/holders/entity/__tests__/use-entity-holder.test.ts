import { act, renderHook } from "@testing-library/react";

import { useEntity } from "../use-entity-holder";

describe("Entity React integration", () => {
  it("keeps one EntityHolder and reacts to watched arguments", async () => {
    const query = vi.fn(async (value: string) => ({ data: value.length }));
    const hook = renderHook(
      ({ watch, enabled }: { watch: [string]; enabled: boolean }) =>
        useEntity({ queryFn: query, watch, enabled }),
      { initialProps: { watch: ["one"], enabled: true } },
    );

    await act(async () => undefined);
    const first = hook.result.current.holder;

    expect(query).toHaveBeenCalledWith("one");
    Object.values(hook.result.current);
    expect(hook.result.current.data).toBe(3);
    hook.result.current.setData(4);
    expect(hook.result.current.isFilled).toBe(true);
    await hook.result.current.refresh("two");
    await hook.result.current.fromApi(async () => ({ data: 5 }));
    hook.result.current.reset();
    hook.rerender({ watch: ["next"], enabled: false });
    expect(hook.result.current.holder).toBe(first);
    hook.unmount();
  });
});
