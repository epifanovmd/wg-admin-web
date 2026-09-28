import { renderHook } from "@testing-library/react";

import { useLatestFn } from "../use-latest-fn";

describe("useLatestFn", () => {
  it("returns a stable wrapper that calls the latest function", () => {
    type Fn = (value: number) => number;
    const initial: { fn: Fn | undefined } = { fn: value => value + 1 };
    const hook = renderHook(({ fn }) => useLatestFn(fn), {
      initialProps: initial,
    });
    const stable = hook.result.current;

    hook.rerender({ fn: (value: number) => value * 10 });
    expect(hook.result.current).toBe(stable);
    expect(stable?.(2)).toBe(20);

    hook.rerender({ fn: undefined });
    expect(stable?.(3)).toBe(30);
  });

  it("returns undefined when no function is given on the first render", () => {
    const hook = renderHook(() => useLatestFn(undefined));

    expect(hook.result.current).toBeUndefined();
  });
});
